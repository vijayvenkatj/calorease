"use client"

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type MacroPieChartProps = {
  carbs: number
  protein: number
  fats: number
}

const COLORS = [
  '#60A5FA', // carbs - blue-400
  '#34D399', // protein - emerald-400
  '#F59E0B', // fats - amber-500
]

export default function MacroPieChart({ carbs, protein, fats }: MacroPieChartProps) {
  const total = Math.max(carbs + protein + fats, 1)
  const data = useMemo(
    () => [
      { name: 'Carbs', value: carbs },
      { name: 'Protein', value: protein },
      { name: 'Fats', value: fats },
    ],
    [carbs, protein, fats]
  )

  return (
    <Card className="rounded-2xl border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base text-black dark:text-white">Macronutrient Breakdown</CardTitle>
        <CardDescription className="text-gray-500">Today’s distribution of carbs, protein, and fats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${Math.round((value / total) * 100)}%`, name]} />
              <Legend verticalAlign="bottom" height={24} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-3 text-center text-xs text-muted-foreground">
          <div>{Math.round((carbs / total) * 100)}% Carbs</div>
          <div>{Math.round((protein / total) * 100)}% Protein</div>
          <div>{Math.round((fats / total) * 100)}% Fats</div>
        </div>
      </CardContent>
    </Card>
  )
}


