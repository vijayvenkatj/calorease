'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/utils/trpc'
import { Activity } from 'lucide-react'

interface NutritionSummaryProps {
  date?: string // YYYY-MM-DD format
}

export default function NutritionSummary({ date }: NutritionSummaryProps) {
  const { data: summary, isLoading, error } = trpc.food.getDailySummary.useQuery({
    date: date || new Date().toISOString().split('T')[0],
  })

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <p className="text-destructive text-sm">Failed to load nutrition summary</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  const nutrients = [
    {
      label: 'Calories',
      value: Math.round(summary.totalCalories),
      unit: 'cal',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      goal: 2000,
    },
    {
      label: 'Protein',
      value: Math.round(summary.totalProtein),
      unit: 'g',
      bgColor: 'bg-rose-500',
      lightBg: 'bg-rose-100 dark:bg-rose-900/30',
      textColor: 'text-rose-600 dark:text-rose-400',
      goal: 150,
    },
    {
      label: 'Carbs',
      value: Math.round(summary.totalCarbs),
      unit: 'g',
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      goal: 250,
    },
    {
      label: 'Fats',
      value: Math.round(summary.totalFats),
      unit: 'g',
      bgColor: 'bg-violet-500',
      lightBg: 'bg-violet-100 dark:bg-violet-900/30',
      textColor: 'text-violet-600 dark:text-violet-400',
      goal: 70,
    },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle>Today's Nutrition</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {summary.logCount} {summary.logCount === 1 ? 'entry' : 'entries'}
          </Badge>
        </div>
        <CardDescription>
          Your daily nutrition summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary.totalCalories === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Start logging your meals to see your nutrition summary!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nutrients.map((nutrient) => {
              const percentage = Math.min((nutrient.value / nutrient.goal) * 100, 100)
              
              return (
                <div key={nutrient.label} className="space-y-2">
                  <div className={`p-3 rounded-lg ${nutrient.lightBg}`}>
                    <div className={`text-2xl font-bold ${nutrient.textColor}`}>
                      {nutrient.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      of {nutrient.goal} {nutrient.unit}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">{nutrient.label}</div>
                      <div className="text-xs text-muted-foreground">{Math.round(percentage)}%</div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${nutrient.bgColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
