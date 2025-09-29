"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false }) as any
const LineChart = dynamic(async () => (await import('recharts')).LineChart, { ssr: false }) as any
const Line = dynamic(async () => (await import('recharts')).Line, { ssr: false }) as any
const XAxis = dynamic(async () => (await import('recharts')).XAxis, { ssr: false }) as any
const YAxis = dynamic(async () => (await import('recharts')).YAxis, { ssr: false }) as any
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false }) as any
const Legend: any = dynamic(() => import('recharts').then(m => m.Legend as any), { ssr: false })

type Props = {
  data: Array<{ date: string; calories: number }>
  rangeLabel: string
}

export default function CaloriesTrendCard({ data, rangeLabel }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm">
      <CardHeader>
        <CardTitle>Calories Trend</CardTitle>
        <CardDescription>Last {rangeLabel}</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


