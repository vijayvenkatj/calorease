"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false }) as any
const RadarChart = dynamic(async () => (await import('recharts')).RadarChart, { ssr: false }) as any
const PolarGrid = dynamic(async () => (await import('recharts')).PolarGrid, { ssr: false }) as any
const PolarAngleAxis = dynamic(async () => (await import('recharts')).PolarAngleAxis, { ssr: false }) as any
const PolarRadiusAxis = dynamic(async () => (await import('recharts')).PolarRadiusAxis, { ssr: false }) as any
const Radar = dynamic(async () => (await import('recharts')).Radar, { ssr: false }) as any
const Legend: any = dynamic(() => import('recharts').then(m => m.Legend as any), { ssr: false })

type Item = { subject: string; A: number; B: number; fullMark: number }

type Props = { data: Item[] }

export default function NutrientRadarCard({ data }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm h-[420px]">
      <CardHeader>
        <CardTitle>Nutrient Balance</CardTitle>
        <CardDescription>Average vs goal (lower values suggest deficiency)</CardDescription>
      </CardHeader>
      <CardContent className="h-full px-8 pb-8">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius={85}>
              <PolarGrid />
              {/* Move axis labels away from edges and hide numeric radius ticks to avoid overlap */}
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} tickMargin={18} />
              <PolarRadiusAxis tick={false} axisLine={false} tickLine={false} />
              <Radar name="Avg" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
              <Radar name="Goal" dataKey="B" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
            <span>Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-blue-400" />
            <span>Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


