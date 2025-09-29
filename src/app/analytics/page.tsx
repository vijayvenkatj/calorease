import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Leaf, LogOut } from 'lucide-react'
import CaloriesTrendCard from '@/components/analytics/CaloriesTrendCard'
import MacroTrendCard from '@/components/analytics/MacroTrendCard'
import WeightProgressCard from '@/components/analytics/WeightProgressCard'
import GoalProgressCard from '@/components/analytics/GoalProgressCard'
import NutrientRadarCard from '@/components/analytics/NutrientRadarCard'
import SummaryStatsCard from '@/components/analytics/SummaryStatsCard'


type Range = 'daily' | 'weekly' | 'monthly'

function getDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function lastNDays(n: number) {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(getDateKey(d))
  }
  return days
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const range = (typeof searchParams?.range === 'string' ? searchParams.range : 'weekly') as Range

  // Determine window
  const windowDays = range === 'daily' ? 1 : range === 'weekly' ? 7 : 30
  const dayKeys = lastNDays(Math.max(windowDays, 7)) // ensure enough for charts

  // Fetch user data (assumes tables exist). Fallback to empty arrays gracefully.
  const [{ data: foodLogs }, { data: weights }, { data: activities }, { data: goals }] = await Promise.all([
    supabase.from('food_logs').select('*').eq('user_id', user.id).gte('logged_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString()),
    supabase.from('weights').select('*').eq('user_id', user.id).gte('logged_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()),
    supabase.from('activities').select('*').eq('user_id', user.id).gte('performed_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 31).toISOString()),
    supabase.from('goals').select('*').eq('user_id', user.id).limit(1),
  ])

  // Normalize potential nulls from Supabase to arrays
  const safeFoodLogs = Array.isArray(foodLogs) ? foodLogs : []
  const safeWeights = Array.isArray(weights) ? weights : []
  const safeActivities = Array.isArray(activities) ? activities : []
  const safeGoals = Array.isArray(goals) ? goals : []

  // Build datasets
  const caloriesByDay: Record<string, number> = {}
  const macrosByDay: Record<string, { protein: number; carbs: number; fats: number }> = {}
  for (const key of dayKeys) {
    caloriesByDay[key] = 0
    macrosByDay[key] = { protein: 0, carbs: 0, fats: 0 }
  }
  for (const log of safeFoodLogs as any[]) {
    const key = getDateKey(new Date(log.logged_at || log.loggedAt || log.created_at))
    if (!caloriesByDay[key]) caloriesByDay[key] = 0
    if (!macrosByDay[key]) macrosByDay[key] = { protein: 0, carbs: 0, fats: 0 }
    caloriesByDay[key] += Number(log.calories || 0)
    macrosByDay[key].protein += Number(log.protein || 0)
    macrosByDay[key].carbs += Number(log.carbs || 0)
    macrosByDay[key].fats += Number(log.fats || 0)
  }

  const caloriesTrend = dayKeys.map((d) => ({ date: d.slice(5), calories: Math.round(caloriesByDay[d] || 0) }))
  const macroTrend = dayKeys.map((d) => ({ date: d.slice(5), protein: Math.round(macrosByDay[d]?.protein || 0), carbs: Math.round(macrosByDay[d]?.carbs || 0), fats: Math.round(macrosByDay[d]?.fats || 0) }))

  const weightSeries = (safeWeights as any[]).map((w) => ({ date: getDateKey(new Date(w.logged_at || w.created_at)), weight: Number(w.weight), bmi: Number(w.bmi || 0) })).slice(-30)

  const latestGoals = (safeGoals as any[])[0] || { calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fats_goal: 70 }
  const today = dayKeys[dayKeys.length - 1]
  const todayMacros = macrosByDay[today] || { protein: 0, carbs: 0, fats: 0 }
  const todayCalories = caloriesByDay[today] || 0
  const goalProgress = [
    { name: 'Calories', value: Math.min((todayCalories / (latestGoals.calorie_goal || 2000)) * 100, 100) },
    { name: 'Protein', value: Math.min((todayMacros.protein / (latestGoals.protein_goal || 150)) * 100, 100) },
    { name: 'Carbs', value: Math.min((todayMacros.carbs / (latestGoals.carbs_goal || 250)) * 100, 100) },
    { name: 'Fats', value: Math.min((todayMacros.fats / (latestGoals.fats_goal || 70)) * 100, 100) },
  ]

  // Nutrient deficiency radar: compare average macros against goals
  const daysConsidered = Math.max(1, dayKeys.length)
  const avgProtein = dayKeys.reduce((s, d) => s + (macrosByDay[d]?.protein || 0), 0) / daysConsidered
  const avgCarbs = dayKeys.reduce((s, d) => s + (macrosByDay[d]?.carbs || 0), 0) / daysConsidered
  const avgFats = dayKeys.reduce((s, d) => s + (macrosByDay[d]?.fats || 0), 0) / daysConsidered
  const radarData = [
    { subject: 'Protein', A: Math.round(avgProtein), B: latestGoals.protein_goal || 150, fullMark: Math.max(150, latestGoals.protein_goal || 150) },
    { subject: 'Carbs', A: Math.round(avgCarbs), B: latestGoals.carbs_goal || 250, fullMark: Math.max(250, latestGoals.carbs_goal || 250) },
    { subject: 'Fats', A: Math.round(avgFats), B: latestGoals.fats_goal || 70, fullMark: Math.max(70, latestGoals.fats_goal || 70) },
  ]

  // Streak: count consecutive days with logs
  let streak = 0
  for (let i = dayKeys.length - 1; i >= 0; i -= 1) {
    const d = dayKeys[i]
    const hasLog = (macrosByDay[d]?.protein || 0) + (macrosByDay[d]?.carbs || 0) + (macrosByDay[d]?.fats || 0) > 0
    if (hasLog) streak += 1
    else break
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <Link href="/dashboard" aria-label="Go to Dashboard" className="text-xl font-bold text-gray-900 dark:text-white">CalorEase</Link>
              <Link href="/nutrition" className="ml-4 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-black/5 dark:text-gray-200 underline underline-offset-4 decoration-emerald-600/60 dark:decoration-emerald-400/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors">Nutrition</Link> 
              <Link href="/analytics" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-black/5 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/5 transition-colors">Analytics</Link>
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero */}
          <Card className="border border-black/5 overflow-hidden shadow-sm rounded-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                  <p className="text-white/90 text-sm">Insights from your recent logging activity</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  
                  <div className="flex items-center gap-1">
                    <Link href="?range=daily" className={`px-3 py-1 rounded-md ${range === 'daily' ? 'bg-white text-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>Daily</Link>
                    <Link href="?range=weekly" className={`px-3 py-1 rounded-md ${range === 'weekly' ? 'bg-white text-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>Weekly</Link>
                    <Link href="?range=monthly" className={`px-3 py-1 rounded-md ${range === 'monthly' ? 'bg-white text-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>Monthly</Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
            <CaloriesTrendCard data={caloriesTrend} rangeLabel={range === 'monthly' ? '30' : range === 'weekly' ? '7' : '1'} />
            <MacroTrendCard data={macroTrend} />
            <WeightProgressCard data={weightSeries} />
            <GoalProgressCard data={goalProgress} />
            <NutrientRadarCard data={radarData} />
            <SummaryStatsCard
              avgCalories={Math.round(caloriesTrend.reduce((s: number, d: any) => s + d.calories, 0) / caloriesTrend.length || 0)}
              streak={streak}
              avgProtein={Math.round(macroTrend.reduce((s: number, d: any) => s + d.protein, 0) / macroTrend.length || 0)}
              goalCompliance={Math.round(goalProgress.reduce((s, g) => s + g.value, 0) / goalProgress.length)}
            />
            
          </div>
        </div>
      </main>
    </div>
  )
}


