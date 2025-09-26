import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type NutritionFactCardProps = {
  fact: string
}

export default function NutritionFactCard({ fact }: NutritionFactCardProps) {
  return (
    <Card className="rounded-2xl border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-4 flex items-start gap-3 text-sm">
        <div className="mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-slate-200">{fact}</p>
      </CardContent>
    </Card>
  )
}


