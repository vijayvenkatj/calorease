'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ChevronRight, Sparkles, Apple } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/utils/trpc'
import { type FoodItem } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface FoodSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFood: (food: FoodItem) => void
  onCreateCustom: () => void
}

export default function FoodSelector({
  open,
  onOpenChange,
  onSelectFood,
  onCreateCustom,
}: FoodSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: searchResults, isLoading } = trpc.food.searchFoodItems.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length >= 2 }
  )

  const { data: customFoods } = trpc.food.getMyCustomFoodItems.useQuery()

  const handleSelectFood = useCallback((food: FoodItem) => {
    onSelectFood(food)
    onOpenChange(false)
    setSearchQuery('')
  }, [onSelectFood, onOpenChange])

  const handleCreateCustom = useCallback(() => {
    onCreateCustom()
    onOpenChange(false)
  }, [onCreateCustom, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Find Your Food</DialogTitle>
          <DialogDescription>
            Search from our extensive database or create your own custom food
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for foods (e.g., chicken, rice, apple)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* My Custom Foods */}
          {!searchQuery && customFoods && customFoods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                My Custom Foods
              </h3>
              <div className="space-y-2">
                {customFoods.map((food) => (
                  <FoodItemCard
                    key={food.id}
                    food={food}
                    onSelect={handleSelectFood}
                    isCustom
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {debouncedQuery.length >= 2 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Search Results
              </h3>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              )}

              {!isLoading && searchResults && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No foods found matching "{debouncedQuery}"
                  </p>
                  <Button
                    onClick={handleCreateCustom}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Food
                  </Button>
                </div>
              )}

              {!isLoading && searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((food) => (
                    <FoodItemCard
                      key={food.id}
                      food={food}
                      onSelect={handleSelectFood}
                      isCustom={food.isCustom === 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && (!customFoods || customFoods.length === 0) && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
              <p className="text-muted-foreground mb-6">
                Type at least 2 characters to search for foods
              </p>
            </div>
          )}

          {/* Create Custom Button */}
          {searchQuery.length < 2 && (
            <div className="mt-6">
              <Button
                onClick={handleCreateCustom}
                variant="outline"
                className="w-full h-12 gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Create Custom Food
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FoodItemCardProps {
  food: FoodItem
  onSelect: (food: FoodItem) => void
  isCustom?: boolean
}

function FoodItemCard({ food, onSelect, isCustom }: FoodItemCardProps) {
  return (
    <button
      onClick={() => onSelect(food)}
      className={cn(
        "w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium truncate">{food.dishName}</h4>
            {isCustom && (
              <Badge variant="secondary" className="shrink-0">
                Custom
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                {Number(food.calories).toFixed(0)}
              </span>{' '}
              kcal
            </div>
            <div>
              <span className="font-medium text-foreground">
                {Number(food.protein).toFixed(1)}g
              </span>{' '}
              protein
            </div>
            <div>
              <span className="font-medium text-foreground">
                {Number(food.carbohydrates).toFixed(1)}g
              </span>{' '}
              carbs
            </div>
            <div>
              <span className="font-medium text-foreground">
                {Number(food.fats).toFixed(1)}g
              </span>{' '}
              fats
            </div>
          </div>

          {/* Additional nutrients */}
          {(Number(food.fibre) > 0 || Number(food.vitaminC) > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Number(food.fibre) > 0 && (
                <span className="text-xs text-muted-foreground">
                  Fibre: {Number(food.fibre).toFixed(1)}g
                </span>
              )}
              {Number(food.vitaminC) > 0 && (
                <span className="text-xs text-muted-foreground">
                  Vit C: {Number(food.vitaminC).toFixed(1)}mg
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </div>
    </button>
  )
}

