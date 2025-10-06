'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { foodLogFormSchema, type FoodLogFormInput, type MealType, mealTypes } from '@/lib/db/schema'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

interface FoodLoggerProps {
  onSuccess?: () => void
  defaultMealType?: MealType
}

export default function FoodLogger({ onSuccess, defaultMealType }: FoodLoggerProps) {
  const form = useForm<FoodLogFormInput>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues: {
      mealType: defaultMealType || 'breakfast',
      foodName: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
    },
  })

  const utils = trpc.useUtils()

  const addLogMutation = trpc.food.addLog.useMutation({
    onSuccess: () => {
      toast.success('Food logged successfully!')
      form.reset()
      onSuccess?.()
      utils.food.getLogs.invalidate()
      utils.food.getDailySummary.invalidate()
      utils.streak.getStreak.invalidate()
      utils.progress.getWeeklyProgress.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log food')
    }
  })

  const onSubmit = (data: FoodLogFormInput) => {
    const payload = {
      mealType: data.mealType,
      foodName: data.foodName,
      calories: data.calories,
      protein: data.protein || '0',
      carbs: data.carbs || '0',
      fats: data.fats || '0',
    }
    addLogMutation.mutate(payload)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Log Food
        </CardTitle>
        <CardDescription>
          Add a meal or snack to your daily log
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {mealTypes.map((mealType) => (
                        <option key={mealType} value={mealType}>
                          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Chicken Breast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="250"
                      step="0.1"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        step="0.1"
                        min="0"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Carbs (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        step="0.1"
                        min="0"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Fats (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        step="0.1"
                        min="0"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={addLogMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {addLogMutation.isPending ? 'Logging...' : 'Log Food'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
