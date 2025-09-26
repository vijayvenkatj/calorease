import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type TipsCardProps = {
  tips: string[]
}

export default function TipsCard({ tips }: TipsCardProps) {
  return (
    <Card className="rounded-lg border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Daily Tips
        </CardTitle>
        <CardDescription className="text-gray-300">Personalized recommendations for today</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-100">{tip}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


