"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false }) as any
const BarChart = dynamic(async () => (await import('recharts')).BarChart, { ssr: false }) as any
const Bar = dynamic(async () => (await import('recharts')).Bar, { ssr: false }) as any
const XAxis = dynamic(async () => (await import('recharts')).XAxis, { ssr: false }) as any
const YAxis = dynamic(async () => (await import('recharts')).YAxis, { ssr: false }) as any
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false }) as any
const Legend: any = dynamic(() => import('recharts').then(m => m.Legend as any), { ssr: false })

type Props = {
  data: Array<{ date: string; protein: number; carbs: number; fats: number }>
}

export default function MacroTrendCard({ data }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm">
      <CardHeader>
        <CardTitle>Macronutrient Trend</CardTitle>
        <CardDescription>Protein, carbs and fats across days</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="protein" stackId="a" fill="#34D399" />
            <Bar dataKey="carbs" stackId="a" fill="#60A5FA" />
            <Bar dataKey="fats" stackId="a" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


