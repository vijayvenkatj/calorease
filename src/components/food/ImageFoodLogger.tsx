'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

// Types for the API response (transformed format)
interface RecognizedFoodItem {
  name: string
  description: string
  quantity: number
  estimated_nutrition: {
    carbohydrates_g: number
    protein_g: number
    fat_g: number
    calories: number
  }
}

interface FoodRecognitionResponse {
  food_items: RecognizedFoodItem[]
  total_nutrition: {
    total_carbohydrates_g: number
    total_protein_g: number
    total_fat_g: number
    total_calories: number
  }
}

// Editable food item type
interface EditableFoodItem {
  id: string
  name: string
  description: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fats: number
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export default function ImageFoodLogger() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [recognizedItems, setRecognizedItems] = useState<EditableFoodItem[]>([])
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const addBatchLogsMutation = trpc.food.addBatchLogs.useMutation({
    onSuccess: () => {
      toast.success('Food items logged successfully!')
      setRecognizedItems([])
      setFile(null)
      setEditingItem(null)
      // Invalidate queries to refresh the UI
      utils.food.getLogs.invalidate()
      utils.food.getDailySummary.invalidate()
      utils.streak.getStreak.invalidate()
      utils.progress.getWeeklyProgress.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to log food items: ${error.message}`)
    },
  })

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/food/recognize', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to recognize food')
      }

      const data: FoodRecognitionResponse = await res.json()
      
      // Convert recognized items to editable format
      const editableItems: EditableFoodItem[] = data.food_items.map((item, index) => ({
        id: `item-${index}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        calories: item.estimated_nutrition.calories,
        protein: item.estimated_nutrition.protein_g,
        carbs: item.estimated_nutrition.carbohydrates_g,
        fats: item.estimated_nutrition.fat_g,
      }))

      setRecognizedItems(editableItems)
      toast.success(`Recognized ${editableItems.length} food items!`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to recognize food items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleItemEdit = (itemId: string, field: keyof EditableFoodItem, value: string | number) => {
    setRecognizedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const handleLogItems = async () => {
    if (recognizedItems.length === 0) return

    const foodItems = recognizedItems.map(item => ({
      foodName: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
    }))

    addBatchLogsMutation.mutate({
      mealType,
      foodItems,
    })
  }

  const totalCalories = recognizedItems.reduce((sum, item) => sum + item.calories, 0)
  const totalProtein = recognizedItems.reduce((sum, item) => sum + item.protein, 0)
  const totalCarbs = recognizedItems.reduce((sum, item) => sum + item.carbs, 0)
  const totalFats = recognizedItems.reduce((sum, item) => sum + item.fats, 0)

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Log by Photo</CardTitle>
        <CardDescription>Upload a food photo to detect and log items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        {recognizedItems.length === 0 && (
          <>
            <label
              htmlFor="food-photo"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
            >
              {file ? (
                <span className="text-sm text-gray-700">{file.name}</span>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Click to upload or drag & drop</span>
                  <span className="text-xs text-gray-400">PNG, JPG, JPEG</span>
                </div>
              )}
              <input
                id="food-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Detect
                </>
              )}
            </Button>
          </>
        )}

        {/* Review Section */}
        {recognizedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review Detected Items</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRecognizedItems([])
                  setFile(null)
                }}
              >
                Upload New Image
              </Button>
            </div>

            {/* Meal Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <select
                id="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Food Items List */}
            <div className="space-y-3">
              {recognizedItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>

                    {editingItem === item.id ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`${item.id}-calories`} className="text-xs">Calories</Label>
                          <Input
                            id={`${item.id}-calories`}
                            type="number"
                            value={item.calories}
                            onChange={(e) => handleItemEdit(item.id, 'calories', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${item.id}-protein`} className="text-xs">Protein (g)</Label>
                          <Input
                            id={`${item.id}-protein`}
                            type="number"
                            value={item.protein}
                            onChange={(e) => handleItemEdit(item.id, 'protein', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${item.id}-carbs`} className="text-xs">Carbs (g)</Label>
                          <Input
                            id={`${item.id}-carbs`}
                            type="number"
                            value={item.carbs}
                            onChange={(e) => handleItemEdit(item.id, 'carbs', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${item.id}-fats`} className="text-xs">Fats (g)</Label>
                          <Input
                            id={`${item.id}-fats`}
                            type="number"
                            value={item.fats}
                            onChange={(e) => handleItemEdit(item.id, 'fats', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{item.calories}</div>
                          <div className="text-gray-500">cal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{item.protein}g</div>
                          <div className="text-gray-500">protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{item.carbs}g</div>
                          <div className="text-gray-500">carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{item.fats}g</div>
                          <div className="text-gray-500">fats</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-green-50">
              <h4 className="font-medium mb-2">Total Nutrition</h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-700">{totalCalories}</div>
                  <div className="text-gray-600">calories</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700">{totalProtein}g</div>
                  <div className="text-gray-600">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700">{totalCarbs}g</div>
                  <div className="text-gray-600">carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-700">{totalFats}g</div>
                  <div className="text-gray-600">fats</div>
                </div>
              </div>
            </Card>

            {/* Log Button */}
            <Button
              onClick={handleLogItems}
              disabled={addBatchLogsMutation.isPending}
              className="w-full"
            >
              {addBatchLogsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging Items...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Log All Items ({recognizedItems.length})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
