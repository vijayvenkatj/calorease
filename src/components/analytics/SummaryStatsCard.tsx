import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  avgCalories: number
  streak: number
  avgProtein: number
  goalCompliance: number
}

export default function SummaryStatsCard({ avgCalories, streak, avgProtein, goalCompliance }: Props) {
  return (
    <Card className="rounded-2xl border border-black/5 bg-white dark:bg-black shadow-sm">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>At-a-glance stats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xs text-slate-500">Avg Calories</div>
            <div className="text-lg font-semibold">{avgCalories}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xs text-slate-500">Streak</div>
            <div className="text-lg font-semibold">{streak} days</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xs text-slate-500">Avg Protein</div>
            <div className="text-lg font-semibold">{avgProtein} g</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
            <div className="text-xs text-slate-500">Goal Compliance</div>
            <div className="text-lg font-semibold">{goalCompliance}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


