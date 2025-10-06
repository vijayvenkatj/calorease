'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { type MealType, mealTypes, type FoodItem } from '@/lib/db/schema'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import CustomFoodForm from './CustomFoodForm'

interface EnhancedFoodLoggerProps {
  onSuccess?: () => void
  defaultMealType?: MealType
}

const enhancedFoodLogFormSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servingSize: z.string().min(1, 'Serving size is required'),
})

type EnhancedFoodLogFormInput = z.infer<typeof enhancedFoodLogFormSchema>

export default function EnhancedFoodLogger({ onSuccess, defaultMealType }: EnhancedFoodLoggerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const form = useForm<EnhancedFoodLogFormInput>({
    resolver: zodResolver(enhancedFoodLogFormSchema),
    defaultValues: {
      mealType: defaultMealType || 'breakfast',
      servingSize: '1',
    },
  })

  const utils = trpc.useUtils()

  const { data: searchResults, isLoading } = trpc.food.searchFoodItems.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  const addLogMutation = trpc.food.addLog.useMutation({
    onSuccess: () => {
      toast.success('Food logged successfully!')
      setSelectedFood(null)
      setSearchQuery('')
      setShowResults(false)
      form.setValue('servingSize', '1')
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

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food)
    setSearchQuery(food.dishName)
    setShowResults(false)
  }

  const handleLogFood = () => {
    if (!selectedFood) return

    const servingSize = parseFloat(form.getValues('servingSize')) || 1
    const mealType = form.getValues('mealType')

    addLogMutation.mutate({
      mealType,
      foodName: selectedFood.dishName,
      calories: String(Number(selectedFood.calories) * servingSize),
      protein: String(Number(selectedFood.protein) * servingSize),
      carbs: String(Number(selectedFood.carbohydrates) * servingSize),
      fats: String(Number(selectedFood.fats) * servingSize),
    })
  }

  const handleCustomFoodCreated = (food: FoodItem) => {
    setSelectedFood(food)
    setSearchQuery(food.dishName)
  }

  const clearSelection = () => {
    setSelectedFood(null)
    setSearchQuery('')
    setShowResults(false)
  }

  const servingSize = parseFloat(form.watch('servingSize')) || 1

  return (
    <>
      <Card className="border-border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Quick Food Log</CardTitle>
          <CardDescription>
            Search and log your meals instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}>
            <form className="space-y-5">
              {/* Meal Type Pills */}
              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Meal Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {mealTypes.map((mealType) => (
                          <button
                            key={mealType}
                            type="button"
                            onClick={() => field.onChange(mealType)}
                            className={`
                              px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                              ${field.value === mealType
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-muted text-foreground hover:bg-accent border border-border'
                              }
                            `}
                          >
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Food Search */}
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium">Search Food</FormLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Type to search foods (e.g., rice, chicken)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowResults(e.target.value.length >= 2)
                      if (e.target.value !== selectedFood?.dishName) {
                        setSelectedFood(null)
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2 && !selectedFood) {
                        setShowResults(true)
                      }
                    }}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchQuery.length >= 2 && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-xl max-h-[320px] overflow-y-auto">
                      {isLoading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                        </div>
                      )}

                      {!isLoading && searchResults && searchResults.length === 0 && (
                        <div className="p-4 text-center space-y-3">
                          <p className="text-sm text-muted-foreground">
                            No foods found for "{searchQuery}"
                          </p>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowResults(false)
                              setShowCustomForm(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Create Custom Food
                          </Button>
                        </div>
                      )}

                      {!isLoading && searchResults && searchResults.length > 0 && (
                        <div className="p-2">
                          {searchResults.map((food) => (
                            <button
                              key={food.id}
                              type="button"
                              onClick={() => handleSelectFood(food)}
                              className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm truncate">
                                      {food.dishName}
                                    </span>
                                    {food.isCustom === 1 && (
                                      <Badge variant="secondary" className="text-xs shrink-0">
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span>{Number(food.calories).toFixed(0)} cal</span>
                                    <span>{Number(food.protein).toFixed(1)}g protein</span>
                                    <span>{Number(food.carbohydrates).toFixed(1)}g carbs</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Food Display */}
              {selectedFood && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3 mb-3">
                    <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{selectedFood.dishName}</h4>
                      <p className="text-xs text-muted-foreground">per serving</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-background/50 rounded-md py-2.5 px-2">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Calories</div>
                      <div className="font-bold text-base text-emerald-600">
                        {(Number(selectedFood.calories) * servingSize).toFixed(0)}
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-md py-2.5 px-2">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Protein</div>
                      <div className="font-bold text-base">
                        {(Number(selectedFood.protein) * servingSize).toFixed(1)}g
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-md py-2.5 px-2">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Carbs</div>
                      <div className="font-bold text-base">
                        {(Number(selectedFood.carbohydrates) * servingSize).toFixed(1)}g
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-md py-2.5 px-2">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Fats</div>
                      <div className="font-bold text-base">
                        {(Number(selectedFood.fats) * servingSize).toFixed(1)}g
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Serving Size - Only show when food is selected */}
              {selectedFood && (
                <FormField
                  control={form.control}
                  name="servingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Serving Size</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="grid grid-cols-4 gap-2 flex-1">
                          {[0.5, 1, 1.5, 2].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => field.onChange(String(size))}
                              className={`
                                px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${field.value === String(size)
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-muted text-foreground hover:bg-accent border border-border'
                                }
                              `}
                            >
                              {size}x
                            </button>
                          ))}
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="Custom"
                            className="w-full sm:w-28 h-[42px]"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {!selectedFood && (
                  <Button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    variant="outline"
                    className="w-full h-11"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Food
                  </Button>
                )}
                
                {selectedFood && (
                  <Button
                    type="button"
                    onClick={handleLogFood}
                    disabled={addLogMutation.isPending}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base font-medium shadow-sm"
                  >
                    {addLogMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Logging...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Log Food
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Custom Food Form Dialog */}
      <CustomFoodForm
        open={showCustomForm}
        onOpenChange={setShowCustomForm}
        onSuccess={handleCustomFoodCreated}
      />
    </>
  )
}
