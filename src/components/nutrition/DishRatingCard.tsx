"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/utils/trpc'

type DishRatingCardProps = {
  dishName: string
  currentRating?: number
  onRatingChange?: (rating: number) => void
}

export default function DishRatingCard({ dishName, currentRating, onRatingChange }: DishRatingCardProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manualRating, setManualRating] = useState<string>('')
  const [showManualInput, setShowManualInput] = useState(false)

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
        
        const existingRatingIndex = old.findIndex(rating => rating.dishName === dishName)
        
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
      setIsSubmitting(false)
      setShowManualInput(false)
      setManualRating('')
      // Invalidate to ensure we have the latest data from server
      utils.recommendations.getMyRatings.invalidate()
    },
    onError: (error, newRating, context) => {
      console.error('Error rating dish:', error)
      setIsSubmitting(false)
      
      // Revert optimistic update on error
      if (context?.previousRatings) {
        utils.recommendations.getMyRatings.setData(undefined, context.previousRatings)
      }
    },
  })

  const handleStarClick = async (rating: number) => {
    setIsSubmitting(true)
    try {
      await rateDishMutation.mutateAsync({
        dishName,
        rating,
      })
      onRatingChange?.(rating)
    } catch (error) {
      console.error('Failed to rate dish:', error)
    }
  }

  const handleManualRatingSubmit = async () => {
    const rating = parseFloat(manualRating)
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await rateDishMutation.mutateAsync({
        dishName,
        rating,
      })
      onRatingChange?.(rating)
    } catch (error) {
      console.error('Failed to rate dish:', error)
    }
  }

  const displayRating = hoveredRating ?? currentRating ?? 0

  return (
    <Card className="group rounded-lg border border-black/5 dark:border-white/15 bg-white dark:bg-black text-inherit shadow-md hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="pb-0 pt-6">
        <CardTitle className="text-base text-gray-900 dark:text-white">
          {dishName}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Rate this dish from 0.0 to 5.0 stars
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        {/* Star Rating */}
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={isSubmitting}
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

        {/* Manual Rating Input */}
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full"
          >
            {showManualInput ? 'Hide' : 'Set'} Precise Rating (0.0-5.0)
          </Button>
          
          {showManualInput && (
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="e.g., 3.7"
                value={manualRating}
                onChange={(e) => setManualRating(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleManualRatingSubmit}
                disabled={isSubmitting || !manualRating || parseFloat(manualRating) < 0 || parseFloat(manualRating) > 5}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Rate
              </Button>
            </div>
          )}
        </div>

        {currentRating && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your rating: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentRating}/5.0</span>
            </p>
          </div>
        )}

        {isSubmitting && (
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saving rating...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
