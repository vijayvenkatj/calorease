'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import { type FoodItem } from '@/lib/db/schema'

interface CustomFoodFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (food: FoodItem) => void
  onBack?: () => void
}

// Form schema for custom food
const customFoodFormSchema = z.object({
  dishName: z.string().min(1, 'Food name is required').max(200),
  calories: z.string().min(1, 'Calories is required'),
  protein: z.string().min(1, 'Protein is required'),
  carbohydrates: z.string().min(1, 'Carbohydrates is required'),
  fats: z.string().min(1, 'Fats is required'),
  // Optional fields
  fibre: z.string().optional(),
  freeSugar: z.string().optional(),
  sodium: z.string().optional(),
  calcium: z.string().optional(),
  iron: z.string().optional(),
  vitaminC: z.string().optional(),
  folate: z.string().optional(),
})

type CustomFoodFormInput = z.infer<typeof customFoodFormSchema>

export default function CustomFoodForm({
  open,
  onOpenChange,
  onSuccess,
  onBack,
}: CustomFoodFormProps) {
  const form = useForm<CustomFoodFormInput>({
    resolver: zodResolver(customFoodFormSchema),
    defaultValues: {
      dishName: '',
      calories: '',
      protein: '',
      carbohydrates: '',
      fats: '',
      fibre: '',
      freeSugar: '',
      sodium: '',
      calcium: '',
      iron: '',
      vitaminC: '',
      folate: '',
    },
  })

  const utils = trpc.useUtils()

  const createFoodMutation = trpc.food.createFoodItem.useMutation({
    onSuccess: (data) => {
      toast.success('Custom food created successfully!')
      form.reset()
      utils.food.getMyCustomFoodItems.invalidate()
      onSuccess(data)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create custom food')
    },
  })

  const onSubmit = (data: CustomFoodFormInput) => {
    createFoodMutation.mutate({
      dishName: data.dishName,
      calories: data.calories,
      protein: data.protein,
      carbohydrates: data.carbohydrates,
      fats: data.fats,
      fibre: data.fibre || '0',
      freeSugar: data.freeSugar || '0',
      sodium: data.sodium || '0',
      calcium: data.calcium || '0',
      iron: data.iron || '0',
      vitaminC: data.vitaminC || '0',
      folate: data.folate || '0',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <ChefHat className="h-6 w-6" />
                Create Custom Food
              </DialogTitle>
              <DialogDescription>
                Add your own food with nutritional information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Food Name */}
            <FormField
              control={form.control}
              name="dishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grilled Chicken Salad"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Macros */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Primary Nutrients (Required)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          step="0.01"
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
                      <FormLabel>Protein (g) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="25"
                          step="0.01"
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
                  name="carbohydrates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          step="0.01"
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
                      <FormLabel>Fats (g) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Nutrients (Optional) */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Additional Nutrients (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fibre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fibre (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="freeSugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Sugar (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="calcium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calcium (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="iron"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iron (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="vitaminC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vitamin C (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
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
                  name="folate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folate (µg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFoodMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {createFoodMutation.isPending ? 'Creating...' : 'Create Food'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

