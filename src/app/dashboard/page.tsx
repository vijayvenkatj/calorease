import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FoodLogger from '@/components/food/FoodLogger'
import FoodLogList from '@/components/food/FoodLogList'
import NutritionSummary from '@/components/food/NutritionSummary'
import ImageFoodLogger from '@/components/food/ImageFoodLogger' // new component
import WaterIntakeCard from '@/components/WaterIntakeCard'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter(Boolean)
      .join(' ') ||
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.given_name as string | undefined) ||
    (user.user_metadata?.preferred_username as string | undefined) ||
    'there'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'

  // Water intake demo values (replace with dynamic data)
  const waterCurrentMl = 1800
  const waterGoalMl = 2500

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CalorEase</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
           <Card className="border border-black/5 overflow-hidden shadow-sm rounded-2xl">
             <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6">
              <div className="flex items-center justify-between gap-6 text-white">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                   <p className="text-white/90 text-sm">Track your nutrition and achieve your wellness goals</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-white text-green-700 flex items-center justify-center text-sm font-semibold shadow">
                    {initials}
                  </div>
                  <div className="leading-tight text-right">
                     <p className="text-[11px] text-white/80">Welcome back</p>
                     <p className="text-sm font-semibold tracking-wide">{displayName}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Nutrition Summary */}
          <NutritionSummary />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
            {/* Food Logger */}
            <div className="lg:col-span-1 space-y-6 sticky top-8">
              <FoodLogger />
              <ImageFoodLogger /> {/* new upload-by-photo option */}
            </div>

            {/* Food Log List */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">Today's Food Log</h3>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex-1 min-h-0">
                <FoodLogList />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Water Intake */}
            <WaterIntakeCard currentMl={waterCurrentMl} goalMl={waterGoalMl} />

            <Card className="rounded-2xl border border-black/5 bg-white/80 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>Your nutrition journey this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">5/7</div>
                <p className="text-sm text-gray-600">days logging complete</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-black/5 bg-white/80 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Streak</CardTitle>
                <CardDescription>Consecutive days of logging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">3</div>
                <p className="text-sm text-gray-600">days in a row</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-black/5 bg-white/80 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Average Daily</CardTitle>
                <CardDescription>Your typical caloric intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">1,850</div>
                <p className="text-sm text-gray-600">calories per day</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
