"use client"

import Image from 'next/image'
import { Utensils } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type MacroBreakdown = {
  protein: number
  carbs: number
  fats: number
}

export type MealSuggestion = {
  id: string
  name: string
  imageUrl?: string
  calories: number
  macros: MacroBreakdown
}

type MealSuggestionCardProps = {
  meal: MealSuggestion
  onSwap?: (mealId: string) => void
  onSave?: (mealId: string) => void
}

export default function MealSuggestionCard({ meal, onSwap, onSave }: MealSuggestionCardProps) {
  const { id, name, imageUrl, calories, macros } = meal

  return (
    <Card className="group rounded-lg border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-md hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
          <Utensils className="h-4 w-4 text-emerald-600" />
          {name}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">{calories} kcal</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 aspect-[16/9]">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">No image</div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-slate-100 dark:bg-white/5 py-2 border border-slate-200 dark:border-white/10">
            <p className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Protein</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{macros.protein}g</p>
          </div>
          <div className="rounded-lg bg-slate-100 dark:bg-white/5 py-2 border border-slate-200 dark:border-white/10">
            <p className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">Carbs</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{macros.carbs}g</p>
          </div>
          <div className="rounded-lg bg-slate-100 dark:bg-white/5 py-2 border border-slate-200 dark:border-white/10">
            <p className="text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-300">Fats</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{macros.fats}g</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            aria-label="Swap meal"
            size="lg"
            onClick={() => onSwap?.(id)}
            className="w-full min-h-11 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-black dark:text-white dark:border-white/15 dark:hover:bg-white/10"
          >
            Swap
          </Button>
          <Button
            aria-label="Save meal to plan"
            size="lg"
            onClick={() => onSave?.(id)}
            className="w-full min-h-11 bg-green-600 text-white hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Save to Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


