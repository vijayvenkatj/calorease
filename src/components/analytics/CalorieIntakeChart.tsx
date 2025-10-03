'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface CalorieIntakeChartProps {
  dailyCalories: Array<{ date: string; calories: number }>
  avgDailyCalories: number
  goalCalories: number
  days: number
}

export default function CalorieIntakeChart({ dailyCalories, avgDailyCalories, goalCalories, days }: CalorieIntakeChartProps) {
  if (dailyCalories.length === 0) return null

  return (
    <Card className="border-border hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl">Daily Calorie Intake</CardTitle>
            <CardDescription className="mt-1">Your intake vs goal over the last {days} days</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Avg: {avgDailyCalories} cal
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyCalories} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis 
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ 
                  value: 'Calories', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  color: 'hsl(var(--foreground))'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px'
                }}
              />
              <Bar 
                dataKey="calories" 
                fill="hsl(var(--primary))"
                name="Actual Calories"
                radius={[8, 8, 0, 0]}
              />
              <ReferenceLine 
                y={goalCalories} 
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: `Goal: ${goalCalories} cal`, 
                  position: 'insideTopRight',
                  fill: 'hsl(142 76% 36%)',
                  fontSize: 13,
                  fontWeight: 600,
                  offset: 10
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

