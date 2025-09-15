'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { foodLogFormSchema, insertFoodLogSchema, type FoodLogFormInput, type MealType, mealTypes } from '@/lib/db/schema'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

interface FoodLoggerProps {
  onSuccess?: () => void
  defaultMealType?: MealType
}

export default function FoodLogger({ onSuccess, defaultMealType }: FoodLoggerProps) {
  const [isOpen, setIsOpen] = useState(false)

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
      setIsOpen(false)
      onSuccess?.()
      // Invalidate and refetch food logs
      utils.food.getLogs.invalidate()
      utils.food.getDailySummary.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log food')
    }
  })

  const onSubmit = (data: FoodLogFormInput) => {
    // Transform form data to API format
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

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Log Food
      </Button>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Log Food</CardTitle>
        <CardDescription>
          Add a meal or snack to your daily log
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        step="0.1"
                        min="0"
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
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        step="0.1"
                        min="0"
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
                    <FormLabel>Fats (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        step="0.1"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  form.reset()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addLogMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {addLogMutation.isPending ? 'Logging...' : 'Log Food'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
