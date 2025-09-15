# CalorEase Onboarding Flow Setup

## Overview

This document describes the complete onboarding flow implementation for CalorEase, featuring step-based data collection before Supabase signup with Drizzle ORM for type-safe database operations.

## Architecture

### 🏗️ Tech Stack
- **Database**: PostgreSQL with Supabase
- **ORM**: Drizzle ORM for type-safe database operations
- **API**: tRPC for end-to-end type safety
- **State Management**: Zustand with localStorage persistence
- **Forms**: React Hook Form with Zod validation
- **UI**: ShadCN UI components with Tailwind CSS

### 📊 Database Schema

```sql
-- Profiles table with 1:1 relation to auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  weight numeric(5,2) NOT NULL,
  height numeric(5,2) NOT NULL,
  goals text NOT NULL,
  activity_level text NOT NULL,
  waist numeric(5,2),
  hips numeric(5,2),
  chest numeric(5,2),
  arms numeric(5,2),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);
```

## Flow Steps

### 1. Personal Data Collection
- **Route**: `/onboarding` (Step 0)
- **Data**: Name, age, gender, weight, height
- **Validation**: Zod schema with age limits, weight/height ranges
- **Storage**: Zustand store with localStorage persistence

### 2. Goals Selection
- **Route**: `/onboarding` (Step 1) 
- **Options**: Lose weight, gain muscle, maintain weight, improve health, increase strength
- **UI**: Interactive cards with icons and descriptions
- **Validation**: Required selection

### 3. Activity Level
- **Route**: `/onboarding` (Step 2)
- **Options**: Sedentary, lightly active, moderately active, very active, extra active
- **Features**: BMR multiplier display, detailed descriptions
- **Validation**: Required selection

### 4. Body Measurements (Optional)
- **Route**: `/onboarding` (Step 3)
- **Data**: Waist, hips, chest, arms (all optional)
- **Features**: Skip option, measurement tips, optional validation
- **Purpose**: Enhanced progress tracking

### 5. Account Creation
- **Route**: `/onboarding` (Step 4)
- **Data**: Email, password with confirmation
- **Features**: Real-time password strength validation, account creation with all collected data
- **Flow**: Creates Supabase user + profile record in single transaction

## Key Features

### 🔄 State Management
- **Persistent Storage**: Zustand with localStorage (excludes sensitive signup data)
- **Step Validation**: Cannot proceed to next step without completing current
- **Data Integrity**: All required fields validated before account creation
- **Recovery**: Browser refresh maintains progress (except signup credentials)

### 🎨 Professional UI
- **Modern Design**: Gradient backgrounds, backdrop blur effects
- **Progress Tracking**: Step indicator with completion states
- **Responsive Layout**: Mobile-first design with desktop enhancements
- **Interactive Elements**: Hover states, transitions, loading indicators

### 🔒 Type Safety
- **End-to-End Types**: From database schema to UI components
- **Zod Validation**: Runtime type checking with user-friendly error messages
- **tRPC Integration**: Type-safe API calls with automatic inference
- **Drizzle ORM**: Compile-time SQL type checking

### 📱 User Experience
- **Smart Navigation**: Auto-redirect based on completion state
- **Error Handling**: Graceful error messages with toast notifications
- **Loading States**: Visual feedback during async operations
- **Accessibility**: Proper labels, keyboard navigation, screen reader support

## Setup Instructions

### 1. Environment Variables
```env
# Required for Drizzle connection
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Migration
```bash
# Run the included migration
psql $DATABASE_URL -f drizzle/0000_initial_profiles.sql
```

### 3. Dependencies
All required dependencies are already installed:
- `drizzle-orm` - Database ORM
- `drizzle-zod` - Zod schema generation
- `zustand` - State management
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Zod integration
- `sonner` - Toast notifications

### 4. File Structure
```
src/
├── app/
│   ├── onboarding/
│   │   ├── layout.tsx              # Onboarding layout with progress
│   │   ├── page.tsx                # Main onboarding flow controller
│   │   └── components/
│   │       ├── PersonalDataStep.tsx
│   │       ├── GoalsStep.tsx
│   │       ├── ActivityLevelStep.tsx
│   │       ├── MeasurementsStep.tsx
│   │       └── SignupStep.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema + Zod validation
│   │   └── index.ts                # Database connection
│   └── stores/
│       └── onboarding.ts           # Zustand state management
└── server/
    └── api/
        └── trpc.ts                 # tRPC router with onboarding mutations
```

## API Endpoints

### tRPC Mutations
- `onboarding.completeSignupWithOnboarding` - Creates user + profile
- `onboarding.createProfile` - Creates profile for existing user
- `onboarding.getProfile` - Retrieves user profile
- `onboarding.updateProfile` - Updates existing profile

## Usage Flow

1. **User visits** `/` → Redirected to `/onboarding`
2. **Step 1-4**: Collect and validate data with localStorage persistence
3. **Step 5**: Create account with all collected data via tRPC mutation
4. **Success**: Redirect to `/dashboard`, clear onboarding state
5. **Existing users**: Can access `/auth/login` via header link

## Security Features

- **RLS Policies**: Row-level security on profiles table
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **Password Security**: Strong password requirements with visual feedback
- **Session Management**: Automatic Supabase session handling

## Customization

### Adding New Steps
1. Add step to `steps` array in layout
2. Create new component in `components/`
3. Add to step array in main page
4. Update Zustand store with new data structure
5. Update tRPC mutation if needed

### Modifying Validation
- Update Zod schemas in `src/lib/db/schema.ts`
- Form validation automatically updates
- Database constraints update via migration

### Styling Changes
- Components use Tailwind classes
- Consistent design system with ShadCN components
- Easy theme customization via CSS variables

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **Type Errors**: Run `npm run build` to check TypeScript issues
3. **State Not Persisting**: Check localStorage permissions
4. **Supabase Errors**: Verify environment variables and API keys

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check linting errors
```

This onboarding flow provides a professional, type-safe, and user-friendly experience for new CalorEase users while maintaining data integrity and security throughout the process.
