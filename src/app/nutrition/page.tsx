import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MealSuggestionCard, { MealSuggestion } from '@/components/nutrition/MealSuggestionCard'
import TipsCard from '@/components/nutrition/TipsCard'
import NutritionFactCard from '@/components/nutrition/NutritionFactCard'
import MacroPieChartContainer from '@/components/nutrition/MacroPieChartContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Leaf, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function NutritionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

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

  // Placeholder/demo data; replace with real queries later
  const suggestions: MealSuggestion[] = [
    {
      id: '1',
      name: 'Grilled Chicken Bowl',
      imageUrl: '/vercel.svg',
      calories: 520,
      macros: { protein: 42, carbs: 48, fats: 16 },
    },
    {
      id: '2',
      name: 'Mediterranean Salad',
      imageUrl: '/globe.svg',
      calories: 380,
      macros: { protein: 18, carbs: 34, fats: 20 },
    },
    {
      id: '3',
      name: 'Tofu Veggie Stir-fry',
      imageUrl: '/window.svg',
      calories: 450,
      macros: { protein: 25, carbs: 55, fats: 12 },
    },
  ]

  const dailyTips = [
    'Add a serving of high-fiber veggies to lunch.',
    'Prioritize lean protein at dinner to support recovery.',
    'Stay hydrated — aim for 2–3L today.',
  ]

  const funFact = 'Bananas are berries, but strawberries are not.'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
      <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CalorEase</h1>
              <Link
                href="/dashboard"
                aria-label="Go to Dashboard"
                className="ml-4 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 underline underline-offset-4 decoration-emerald-600/60 hover:text-gray-900 hover:bg-black/5 dark:text-gray-200 dark:decoration-emerald-400/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="border border-black/5 overflow-hidden shadow-sm rounded-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6">
              <div className="flex items-center justify-between gap-6 text-white">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Nutrition</h2>
                  <p className="text-white/90 text-sm">Simple, actionable insights for your daily meals</p>
                </div>
                
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white text-gray-900">AI Meal Suggestions</h3>
                  <p className="text-sm text-gray-600">Curated for your goals</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.slice(0, 3).map((meal) => (
                    <MealSuggestionCard key={meal.id} meal={meal} />
                  ))}
                </div>
              </section>

              <section>
                <TipsCard tips={dailyTips} />
              </section>
            </div>

            <div className="lg:col-span-1 space-y-8 sticky top-16 z-10 self-start">
              <section>
                <MacroPieChartContainer />
              </section>

              <section>
                <NutritionFactCard fact={funFact} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

