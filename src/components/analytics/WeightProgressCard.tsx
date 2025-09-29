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
  data: Array<{ date: string; weight: number; bmi?: number }>
}

export default function WeightProgressCard({ data }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm">
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
        <CardDescription>Track changes over time</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bmi" stroke="#F59E0B" strokeWidth={1} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


