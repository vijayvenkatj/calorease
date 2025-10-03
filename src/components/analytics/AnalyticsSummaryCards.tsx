'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Target, TrendingDown, TrendingUp } from 'lucide-react'

// Helper function to get goal display text
function getGoalDisplayText(goal: string): string {
  switch (goal) {
    case 'lose_weight':
      return 'Lose Weight'
    case 'gain_muscle':
      return 'Gain Muscle'
    case 'maintain_weight':
      return 'Maintain Weight'
    case 'improve_health':
      return 'Improve Health'
    case 'increase_strength':
      return 'Increase Strength'
    default:
      return 'Unknown Goal'
  }
}

interface AnalyticsSummaryCardsProps {
  analytics: {
    avgDailyCalories: number
    daysLogged: number
    totalWeightChange: number
    startWeight: number
    endWeight: number
    maintenanceCalories: number
    goalCalories: number
    userGoal: string
    targetWeeklyWeightChange: number
    hasEnoughData: boolean
  }
}

export default function AnalyticsSummaryCards({ analytics }: AnalyticsSummaryCardsProps) {
  const { hasEnoughData } = analytics

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Daily Calories */}
      <Card className="border-border hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm font-medium">Avg Daily Calories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.avgDailyCalories}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Over {analytics.daysLogged} days
          </p>
        </CardContent>
      </Card>

      {/* Weight Change */}
      <Card className="border-border hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              analytics.totalWeightChange < 0 
                ? 'bg-green-500/10 dark:bg-green-500/20' 
                : 'bg-orange-500/10 dark:bg-orange-500/20'
            }`}>
              {analytics.totalWeightChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <CardTitle className="text-sm font-medium">Weight Change</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${
            analytics.totalWeightChange < 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {analytics.totalWeightChange > 0 ? '+' : ''}{analytics.totalWeightChange} kg
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.startWeight} → {analytics.endWeight} kg
          </p>
        </CardContent>
      </Card>

      {/* Maintenance Calories */}
      <Card className="border-border hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.maintenanceCalories}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {hasEnoughData ? 'Calculated TDEE' : 'Need more data'}
          </p>
        </CardContent>
      </Card>

      {/* Goal Calories */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-900/20 dark:to-green-900/20 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-sm font-medium">Goal Calories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {analytics.goalCalories}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {getGoalDisplayText(analytics.userGoal)}
            </p>
            {analytics.targetWeeklyWeightChange !== 0 && (
              <Badge variant="outline" className="text-xs border-emerald-300 dark:border-emerald-700">
                {analytics.targetWeeklyWeightChange > 0 ? '+' : ''}{analytics.targetWeeklyWeightChange} kg/week
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

