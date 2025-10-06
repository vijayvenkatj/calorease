'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import { Loader2, Save, User, Target, Ruler, Bell } from 'lucide-react'

// Form schema for react-hook-form (strings for inputs)
const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Age must be realistic'),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.string().min(1, 'Weight is required'),
  height: z.string().min(1, 'Height is required'),
  goals: z.enum(['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_health', 'increase_strength']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  waist: z.string().optional(),
  hips: z.string().optional(),
  chest: z.string().optional(),
  arms: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { data: profile, isLoading } = trpc.onboarding.getMyProfile.useQuery()
  const { data: notifSettings } = trpc.notifications.getMySettings.useQuery()
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      age: 25,
      gender: 'male',
      weight: '70',
      height: '170',
      goals: 'maintain_weight',
      activityLevel: 'moderately_active',
      waist: '',
      hips: '',
      chest: '',
      arms: '',
    },
  })

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender as 'male' | 'female' | 'other',
        weight: String(profile.weight),
        height: String(profile.height),
        goals: profile.goals as z.infer<typeof profileFormSchema>['goals'],
        activityLevel: profile.activityLevel as z.infer<typeof profileFormSchema>['activityLevel'],
        waist: profile.waist ? String(profile.waist) : '',
        hips: profile.hips ? String(profile.hips) : '',
        chest: profile.chest ? String(profile.chest) : '',
        arms: profile.arms ? String(profile.arms) : '',
      })
    }
  }, [profile, form])

  const utils = trpc.useUtils()

  const updateMutation = trpc.onboarding.updateMyProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      utils.onboarding.getMyProfile.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const upsertNotif = trpc.notifications.upsertMySettings.useMutation({
    onSuccess: () => {
      utils.notifications.getMySettings.invalidate()
      toast.success('Notification settings updated')
    },
    onError: (e) => toast.error(e.message),
  })


  const onSubmit = (data: ProfileFormData) => {
    // Transform form data to API format
    updateMutation.mutate({
      name: data.name,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      goals: data.goals,
      activityLevel: data.activityLevel,
      waist: data.waist || undefined,
      hips: data.hips || undefined,
      chest: data.chest || undefined,
      arms: data.arms || undefined,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Basic information about yourself
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="13"
                        max="120"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="170"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals & Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & Activity
            </CardTitle>
            <CardDescription>
              Your fitness goals and activity level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goal</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="gain_muscle">Gain Muscle</option>
                      <option value="maintain_weight">Maintain Weight</option>
                      <option value="improve_health">Improve Health</option>
                      <option value="increase_strength">Increase Strength</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    This helps us provide personalized recommendations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="sedentary">Sedentary (little to no exercise)</option>
                      <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                      <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                      <option value="very_active">Very Active (6-7 days/week)</option>
                      <option value="extra_active">Extra Active (physical job + exercise)</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    How often do you exercise or engage in physical activity?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Body Measurements (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Body Measurements
            </CardTitle>
            <CardDescription>
              Optional measurements for detailed tracking (all in cm)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="waist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="80"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hips</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="95"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chest</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Email reminders to log food and water
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email reminders</div>
                <div className="text-sm text-muted-foreground">Receive a simple reminder once a day</div>
              </div>
              <button
                type="button"
                className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  (notifSettings?.emailEnabled ?? 1) === 1 ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => {
                  const enabled = (notifSettings?.emailEnabled ?? 1) === 1
                  upsertNotif.mutate({ emailEnabled: !enabled, frequency: (notifSettings?.frequency as 'daily'|'weekly') || 'daily' })
                }}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    (notifSettings?.emailEnabled ?? 1) === 1 ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            size="lg"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

