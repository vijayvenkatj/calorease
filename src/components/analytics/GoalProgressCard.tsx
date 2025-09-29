"use client"

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false }) as any
const RadialBarChart = dynamic(async () => (await import('recharts')).RadialBarChart, { ssr: false }) as any
const RadialBar = dynamic(async () => (await import('recharts')).RadialBar, { ssr: false }) as any
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false }) as any
const Legend: any = dynamic(() => import('recharts').then(m => m.Legend as any), { ssr: false })

type Item = { name: string; value: number }
type LegendItem = { name: string; current: number; target: number; color: string }

type Props = {
  data: Item[]
  legendItems?: LegendItem[]
}

export default function GoalProgressCard({ data, legendItems = [] }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm h-[420px]">
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>Today vs targets</CardDescription>
      </CardHeader>
      <CardContent className="h-full px-8 pb-8">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="45%" outerRadius="85%" data={data.map((g, i) => ({ ...g, fill: ['#10B981', '#60A5FA', '#34D399', '#F59E0B'][i] }))} startAngle={90} endAngle={-270}>
            <RadialBar minAngle={10} background dataKey="value" cornerRadius={6} />
            <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom legend below chart */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(legendItems.length > 0 ? legendItems : data.map((d, i) => ({ name: d.name, current: Math.round(d.value), target: 100, color: ['#10B981', '#60A5FA', '#34D399', '#F59E0B'][i] }))).map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-md border border-black/5 dark:border-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


