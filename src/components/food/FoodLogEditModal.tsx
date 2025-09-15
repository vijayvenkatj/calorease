'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { foodLogFormSchema, insertFoodLogSchema, type FoodLogFormInput, type FoodLog, mealTypes } from '@/lib/db/schema'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

interface FoodLogEditModalProps {
  foodLog: FoodLog
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function FoodLogEditModal({
  foodLog,
  isOpen,
  onClose,
  onSuccess
}: FoodLogEditModalProps) {
  const form = useForm<FoodLogFormInput>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues: {
      mealType: foodLog.mealType as any,
      foodName: foodLog.foodName,
      calories: String(foodLog.calories || 0),
      protein: String(foodLog.protein || 0),
      carbs: String(foodLog.carbs || 0),
      fats: String(foodLog.fats || 0),
    },
  })

  const utils = trpc.useUtils()

  const updateLogMutation = trpc.food.updateLog.useMutation({
    onSuccess: () => {
      toast.success('Food log updated successfully!')
      onSuccess()
      // Invalidate and refetch food logs
      utils.food.getLogs.invalidate()
      utils.food.getDailySummary.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update food log')
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
    updateLogMutation.mutate({
      id: foodLog.id,
      data: payload,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Edit Food Log</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLogMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {updateLogMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
