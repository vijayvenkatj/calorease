'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/utils/trpc'

interface NutritionSummaryProps {
  date?: string // YYYY-MM-DD format
}

export default function NutritionSummary({ date }: NutritionSummaryProps) {
  const { data: summary, isLoading, error } = trpc.food.getDailySummary.useQuery({
    date: date || new Date().toISOString().split('T')[0],
  })

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">Failed to load nutrition summary</p>
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
      color: 'bg-blue-500',
      goal: 2000, // This could be dynamic based on user profile
    },
    {
      label: 'Protein',
      value: Math.round(summary.totalProtein),
      unit: 'g',
      color: 'bg-red-500',
      goal: 150,
    },
    {
      label: 'Carbs',
      value: Math.round(summary.totalCarbs),
      unit: 'g',
      color: 'bg-yellow-500',
      goal: 250,
    },
    {
      label: 'Fats',
      value: Math.round(summary.totalFats),
      unit: 'g',
      color: 'bg-purple-500',
      goal: 70,
    },
  ]

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Today's Nutrition</span>
          <Badge variant="outline" className="text-xs">
            {summary.logCount} {summary.logCount === 1 ? 'entry' : 'entries'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Your daily nutrition summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nutrients.map((nutrient) => {
            const percentage = Math.min((nutrient.value / nutrient.goal) * 100, 100)
            
            return (
              <div key={nutrient.label} className="text-center">
                <div className="mb-2">
                  <div className="text-2xl font-bold dark:text-white text-gray-900">
                    {nutrient.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {nutrient.unit} / {nutrient.goal} {nutrient.unit}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${nutrient.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="text-xs font-medium text-gray-700">
                  {nutrient.label}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(percentage)}%
                </div>
              </div>
            )
          })}
        </div>

        {summary.totalCalories === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Start logging your meals to see your nutrition summary!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
