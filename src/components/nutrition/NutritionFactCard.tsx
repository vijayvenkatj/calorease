"use client"

import { useMemo, useState } from 'react'
import { Info, Lightbulb, RefreshCw, Droplets, Dumbbell, Leaf } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Tip = {
  text: string
  category: 'Protein' | 'Hydration' | 'Recovery' | 'Greens' | 'General'
}

const iconForCategory: Record<Tip['category'], React.ReactNode> = {
  Protein: <Dumbbell className="h-5 w-5 text-emerald-600" />,
  Hydration: <Droplets className="h-5 w-5 text-blue-600" />,
  Recovery: <Leaf className="h-5 w-5 text-lime-600" />,
  Greens: <Leaf className="h-5 w-5 text-emerald-600" />,
  General: <Lightbulb className="h-5 w-5 text-amber-500" />,
}

const tipsPool: Tip[] = [
  { text: 'Aim for 25–35g of protein per meal to support muscle maintenance.', category: 'Protein' },
  { text: 'Drink 2–3 liters of water daily; add electrolytes after intense workouts.', category: 'Hydration' },
  { text: 'Include leafy greens at least once a day for fiber and micronutrients.', category: 'Greens' },
  { text: 'Have a protein + carb snack within 60 minutes of training for recovery.', category: 'Recovery' },
  { text: 'Focus on minimally processed whole foods 80% of the time.', category: 'General' },
]

type NutritionFactCardProps = {
  fact: string
}

export default function NutritionFactCard({  }: NutritionFactCardProps) {
  const [index, setIndex] = useState(0)

  const tip = useMemo(() => tipsPool[index % tipsPool.length], [index])

  const handleNext = () => setIndex((i) => i + 1)

  return (
    <Card className="rounded-2xl border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 p-2">
              {iconForCategory[tip.category]}
            </div>
            <div>
              <CardTitle className="text-base">Daily Nutrition Tip</CardTitle>
              <CardDescription className="text-xs">Practical, science-informed advice</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{tip.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-100">
          {tip.text}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          
          <Button
            size="sm"
            variant="outline"
            aria-label="Next tip"
            onClick={handleNext}
            className="gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <RefreshCw className="h-4 w-4" />
            Next Tip
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}


