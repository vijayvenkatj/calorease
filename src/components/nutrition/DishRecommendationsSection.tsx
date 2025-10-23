"use client"

import DishRatingCard from '@/components/nutrition/DishRatingCard'
import { trpc } from '@/utils/trpc'

export default function DishRecommendationsSection() {
  const { data: recommendations, isLoading: isLoadingRecommendations, error: recommendationsError } = 
    trpc.recommendations.getInitialRecommendations.useQuery()
  
  const { data: ratings, isLoading: isLoadingRatings } = 
    trpc.recommendations.getMyRatings.useQuery()

  if (isLoadingRecommendations || isLoadingRatings) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (recommendationsError) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          {recommendationsError.message.includes('region not set') 
            ? 'Please set your region in your profile to get personalized dish recommendations.'
            : 'Unable to load dish recommendations. Please try again later.'
          }
        </p>
      </div>
    )
  }

  if (!recommendations?.dishes || recommendations.dishes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          No dish recommendations available for your region.
        </p>
      </div>
    )
  }

  // Create a map of dish names to ratings for quick lookup
  const ratingsMap = new Map(ratings?.map(rating => [rating.dishName, Number(rating.rating)]) || [])

  const handleRatingChange = (dishName: string, newRating: number) => {
    console.log('Rating changed for dish:', dishName, 'to:', newRating)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.dishes.map((dishName: string) => (
        <DishRatingCard
          key={dishName}
          dishName={dishName}
          currentRating={ratingsMap.get(dishName)}
          onRatingChange={(rating) => handleRatingChange(dishName, rating)}
        />
      ))}
    </div>
  )
}
