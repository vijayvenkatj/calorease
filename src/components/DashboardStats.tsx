'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import WaterIntakeCard from '@/components/WaterIntakeCard'
import { trpc } from '@/utils/trpc'
import { Flame, TrendingUp, Trophy } from 'lucide-react'

export default function DashboardStats() {
  const { data: waterData } = trpc.water.getTotalForDate.useQuery({})
  const { data: streakData } = trpc.streak.getStreak.useQuery()
  const { data: progressData } = trpc.progress.getWeeklyProgress.useQuery({})

  const waterCurrentMl = waterData?.totalMl || 0
  const waterGoalMl = 2500 // This could be user-configurable in the profile

  const currentStreak = streakData?.currentStreak || 0
  const daysLogged = progressData?.daysLogged || 0

  // Calculate average daily calories
  const averageDailyCalories = 
    progressData && daysLogged > 0
      ? Math.round(Number(progressData.totalCalories) / daysLogged)
      : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Water Intake */}
      <WaterIntakeCard currentMl={waterCurrentMl} goalMl={waterGoalMl} />

      {/* Weekly Progress */}
      <Card className="border-border bg-card hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Weekly Progress</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {daysLogged}/7
            </div>
            <p className="text-sm text-muted-foreground">days logged this week</p>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="border-border bg-card hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">Current Streak</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">consecutive days</p>
          </div>
        </CardContent>
      </Card>

      {/* Average Daily */}
      <Card className="border-border bg-card hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-base">Daily Average</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {averageDailyCalories > 0 ? averageDailyCalories.toLocaleString() : '-'}
            </div>
            <p className="text-sm text-muted-foreground">calories per day</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
