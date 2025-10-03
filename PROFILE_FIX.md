# Profile Update Fix

## Issue
The profile update endpoint was returning a `400 Bad Request` error when trying to save changes.

## Root Cause
There was a type mismatch between:
1. **Form data**: React Hook Form uses strings for number inputs (from `<Input type="number">`)
2. **API schema**: `insertProfileSchema` uses Zod transforms that expect strings but output numbers
3. **Optional fields**: The measurement fields (waist, hips, chest, arms) had complex transform logic that wasn't compatible with empty strings

## Solution

### 1. Created Separate Form Schema
Created `profileFormSchema` specifically for the form that:
- Uses strings for weight/height/measurements (as they come from inputs)
- Keeps the same validation rules
- Simplifies optional field handling

### 2. Data Transformation on Submit
The form now transforms data before sending to the API:
```typescript
const onSubmit = (data: ProfileFormData) => {
  updateMutation.mutate({
    name: data.name,
    age: data.age,
    gender: data.gender,
    weight: data.weight,      // string → API transforms to number
    height: data.height,      // string → API transforms to number
    goals: data.goals,
    activityLevel: data.activityLevel,
    waist: data.waist || undefined,    // empty string → undefined
    hips: data.hips || undefined,      // empty string → undefined
    chest: data.chest || undefined,    // empty string → undefined
    arms: data.arms || undefined,      // empty string → undefined
  })
}
```

### 3. Fixed Optional Measurement Fields
Updated the schema to properly handle optional measurements:
```typescript
waist: z.union([
  z.string().transform(Number).pipe(z.number().min(40).max(200)),
  z.literal('').transform(() => undefined),
  z.undefined()
]).optional(),
```

This allows:
- Valid number strings (e.g., "80") → transformed to number
- Empty strings ("") → transformed to undefined
- undefined → stays undefined

## Testing
To verify the fix works:
1. Go to `/profile`
2. Edit any field
3. Click "Save Changes"
4. Should see success toast: "Profile updated successfully!"
5. Data should persist on page reload

## Technical Details

### Form Schema (ProfileFormData)
```typescript
{
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: string,          // ← string from input
  height: string,          // ← string from input
  goals: GoalEnum,
  activityLevel: ActivityEnum,
  waist?: string,          // ← optional string
  hips?: string,
  chest?: string,
  arms?: string
}
```

### API Schema (OnboardingData after transform)
```typescript
{
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: number,          // ← transformed from string
  height: number,          // ← transformed from string
  goals: GoalEnum,
  activityLevel: ActivityEnum,
  waist?: number,          // ← transformed from string or undefined
  hips?: number,
  chest?: number,
  arms?: number
}
```

## Files Modified
- `/src/components/ProfileForm.tsx` - Added separate form schema and data transformation
- `/src/lib/db/schema.ts` - Fixed optional measurement field transforms

## Status
✅ **FIXED** - Profile updates now work correctly

