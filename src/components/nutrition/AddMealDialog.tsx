"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

interface AddMealDialogProps {
  onMealAdded?: (mealName: string) => void
}

export default function AddMealDialog({ onMealAdded }: AddMealDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    diet: 'veg' as 'veg' | 'non-veg',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const utils = trpc.useUtils()

  const addCustomMealMutation = trpc.recommendations.addCustomMeal.useMutation({
    onSuccess: (data) => {
      toast.success(`Meal "${data.mealName}" added successfully!`)
      setFormData({ name: '', ingredients: '', diet: 'veg' })
      setOpen(false)
      setIsSubmitting(false)
      onMealAdded?.(data.mealName)
      
      // Invalidate recommendations to refresh the list
      utils.recommendations.getInitialRecommendations.invalidate()
    },
    onError: (error) => {
      console.error('Error adding custom meal:', error)
      toast.error(error.message || 'Failed to add meal. Please try again.')
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.ingredients.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await addCustomMealMutation.mutateAsync({
        name: formData.name.trim(),
        ingredients: formData.ingredients.trim(),
        diet: formData.diet,
      })
    } catch (error) {
      console.error('Error adding custom meal:', error)
      // Error handling is done in the mutation's onError callback
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Meal</DialogTitle>
          <DialogDescription>
            Add a new meal to the recommendation system. You can rate it immediately after adding.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name *</Label>
            <Input
              id="meal-name"
              placeholder="e.g., Quinoa Salad"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients *</Label>
            <textarea
              id="ingredients"
              placeholder="e.g., quinoa, cucumber, tomato, feta, olive oil, lemon, herbs"
              value={formData.ingredients}
              onChange={(e) => handleInputChange('ingredients', e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet">Diet Type *</Label>
            <select
              id="diet"
              value={formData.diet}
              onChange={(e) => handleInputChange('diet', e.target.value as 'veg' | 'non-veg')}
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.ingredients.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
