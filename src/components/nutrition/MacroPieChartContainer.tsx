"use client"

import { Card, CardContent } from '@/components/ui/card'
import { trpc } from '@/utils/trpc'
import MacroPieChart from './MacroPieChart'

type Props = {
  date?: string
}

export default function MacroPieChartContainer({ date }: Props) {
  const { data, isLoading, error } = trpc.food.getDailySummary.useQuery({
    date: date || new Date().toISOString().split('T')[0],
  })

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-black/5 shadow-sm">
        <CardContent className="p-6">
          <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-slate-700" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="rounded-2xl border border-black/5 shadow-sm">
        <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
          Failed to load macronutrient breakdown
        </CardContent>
      </Card>
    )
  }

  return (
    <MacroPieChart carbs={data.totalCarbs} protein={data.totalProtein} fats={data.totalFats} />
  )
}


