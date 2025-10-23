"use client"

import DishRatingCard from '@/components/nutrition/DishRatingCard'
import RecommendationCard from '@/components/nutrition/RecommendationCard'
import AddMealWithRating from '@/components/nutrition/AddMealWithRating'
import { trpc } from '@/utils/trpc'

export default function DishRecommendationsSection() {
  const { data: recommendations, isLoading: isLoadingRecommendations, error: recommendationsError } = 
    trpc.recommendations.getInitialRecommendations.useQuery()
  
  const { data: personalizedRecommendations, isLoading: isLoadingPersonalized, error: personalizedError } = 
    trpc.recommendations.getPersonalizedRecommendations.useQuery()
  
  const { data: ratings, isLoading: isLoadingRatings } = 
    trpc.recommendations.getMyRatings.useQuery()

  const isLoading = isLoadingRecommendations || isLoadingRatings || isLoadingPersonalized

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Create a map of dish names to ratings for quick lookup
  const ratingsMap = new Map(ratings?.map(rating => [rating.dishName, Number(rating.rating)]) || [])

  const handleRatingChange = (dishName: string, newRating: number) => {
    console.log('Rating changed for dish:', dishName, 'to:', newRating)
  }

  // Determine what to show based on user's state
  const hasRatings = ratings && ratings.length > 0
  const hasPersonalizedRecommendations = personalizedRecommendations?.recommendations && personalizedRecommendations.recommendations.length > 0
  const hasInitialRecommendations = recommendations?.dishes && recommendations.dishes.length > 0

  // Show personalized recommendations if user has ratings and we have personalized data
  if (hasRatings && hasPersonalizedRecommendations) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Your Personalized Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Based on your {ratings?.length || 0} rated dishes
            </p>
          </div>
          <AddMealWithRating />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalizedRecommendations.recommendations.map((recommendation: { name: string, similarity: number, health_score: number, calories: number, fat: number, carbs: number, protein: number, serving_scale: string, final_score: number }) => (
            <RecommendationCard
              key={recommendation.name}
              recommendation={recommendation}
              currentRating={ratingsMap.get(recommendation.name)}
              onRatingChange={(rating) => handleRatingChange(recommendation.name, rating)}
            />
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (recommendationsError || personalizedError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Rate Your Regional Dishes</h3>
          <AddMealWithRating />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            {recommendationsError?.message.includes('region not set') 
              ? 'Please set your region in your profile to get personalized dish recommendations.'
              : 'Unable to load dish recommendations. Please try again later.'
            }
          </p>
        </div>
      </div>
    )
  }

  // Show initial recommendations if no ratings yet
  if (hasInitialRecommendations) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Rate Your Regional Dishes</h3>
            <p className="text-sm text-muted-foreground">Help us personalize your recommendations</p>
          </div>
          <AddMealWithRating />
        </div>

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
      </div>
    )
  }

  // Show empty state
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Rate Your Regional Dishes</h3>
          <p className="text-sm text-muted-foreground">Help us personalize your recommendations</p>
        </div>
        <AddMealWithRating />
      </div>
      
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          {hasRatings 
            ? 'No personalized recommendations available yet. Add custom meals to get started!'
            : 'No dish recommendations available for your region. Add custom meals to get started!'
          }
        </p>
      </div>
    </div>
  )
}
