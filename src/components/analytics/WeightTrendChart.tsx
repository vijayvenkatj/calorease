'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WeightTrendChartProps {
  weightLogs: Array<{ date: string; weight: number }>
  totalWeightChange: number
  days: number
}

export default function WeightTrendChart({ weightLogs, totalWeightChange, days }: WeightTrendChartProps) {
  if (weightLogs.length === 0) return null

  return (
    <Card className="border-border hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl">Weight Trend</CardTitle>
            <CardDescription className="mt-1">Your weight progress over the last {days} days</CardDescription>
          </div>
          {weightLogs.length >= 2 && (
            <Badge 
              variant={totalWeightChange < 0 ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {totalWeightChange > 0 ? '+' : ''}{totalWeightChange} kg
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightLogs} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                domain={['dataMin - 1', 'dataMax + 1']}
                label={{ 
                  value: 'Weight (kg)', 
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
                    day: 'numeric',
                    year: 'numeric' 
                  })
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ 
                  fill: 'hsl(var(--primary))', 
                  r: 5,
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))'
                }}
                activeDot={{ 
                  r: 7,
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))'
                }}
                name="Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

