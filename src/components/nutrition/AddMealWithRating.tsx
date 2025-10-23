"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import AddMealDialog from './AddMealDialog'

export default function AddMealWithRating() {
  const [showRating, setShowRating] = useState(false)
  const [mealToRate, setMealToRate] = useState<string>('')
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)

  const utils = trpc.useUtils()

  const rateDishMutation = trpc.recommendations.rateDish.useMutation({
    onMutate: async (newRating) => {
      // Cancel any outgoing refetches
      await utils.recommendations.getMyRatings.cancel()
      
      // Snapshot the previous value
      const previousRatings = utils.recommendations.getMyRatings.getData()
      
      // Optimistically update the cache
      utils.recommendations.getMyRatings.setData(undefined, (old) => {
        if (!old) return old
        
        const existingRatingIndex = old.findIndex(rating => rating.dishName === mealToRate)
        
        if (existingRatingIndex >= 0) {
          // Update existing rating
          const updatedRatings = [...old]
          updatedRatings[existingRatingIndex] = {
            ...updatedRatings[existingRatingIndex],
            rating: String(newRating.rating),
            updatedAt: new Date().toISOString()
          }
          return updatedRatings
        } else {
          // Add new rating
          return [...old, {
            id: `temp-${Date.now()}`,
            userId: 'temp',
            dishName: newRating.dishName,
            rating: String(newRating.rating),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }
      })
      
      return { previousRatings }
    },
    onSuccess: () => {
      setIsRatingSubmitting(false)
      setShowRating(false)
      setMealToRate('')
      setHoveredRating(null)
      toast.success(`Rated "${mealToRate}" successfully!`)
      
      // Invalidate to ensure we have the latest data from server
      utils.recommendations.getMyRatings.invalidate()
      utils.recommendations.getPersonalizedRecommendations.invalidate()
    },
    onError: (error, newRating, context) => {
      console.error('Error rating dish:', error)
      setIsRatingSubmitting(false)
      toast.error('Failed to save rating. Please try again.')
      
      // Revert optimistic update on error
      if (context?.previousRatings) {
        utils.recommendations.getMyRatings.setData(undefined, context.previousRatings)
      }
    },
  })

  const handleMealAdded = (mealName: string) => {
    setMealToRate(mealName)
    setShowRating(true)
  }

  const handleStarClick = async (rating: number) => {
    if (!mealToRate) return
    
    setIsRatingSubmitting(true)
    try {
      await rateDishMutation.mutateAsync({
        dishName: mealToRate,
        rating,
      })
    } catch (error) {
      console.error('Failed to rate dish:', error)
    }
  }

  const handleSkipRating = () => {
    setShowRating(false)
    setMealToRate('')
    setHoveredRating(null)
    toast.info('You can rate this meal later from the recommendations section.')
  }

  const displayRating = hoveredRating ?? 0

  return (
    <div className="space-y-4">
      <AddMealDialog onMealAdded={handleMealAdded} />
      
      {showRating && mealToRate && (
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-800 dark:text-emerald-200">
              Rate Your New Meal
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-300">
              How would you rate "{mealToRate}"? (Optional - you can skip and rate later)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Star Rating */}
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  disabled={isRatingSubmitting}
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`h-8 w-8 transition-colors duration-150 ${
                      star <= displayRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSkipRating}
                disabled={isRatingSubmitting}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              >
                Skip Rating
              </Button>
            </div>

            {isRatingSubmitting && (
              <div className="text-center mt-2">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Saving rating...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
