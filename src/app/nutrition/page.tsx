import AppNav from '@/components/AppNav'
import DishRecommendationsSection from '@/components/nutrition/DishRecommendationsSection'
import TipsCard from '@/components/nutrition/TipsCard'
import NutritionFactCard from '@/components/nutrition/NutritionFactCard'
import MacroPieChartContainer from '@/components/nutrition/MacroPieChartContainer'
import ImageFoodLogger from '@/components/food/ImageFoodLogger'

export default async function NutritionPage() {
  const dailyTips = [
    'Add a serving of high-fiber veggies to lunch.',
    'Prioritize lean protein at dinner to support recovery.',
    'Stay hydrated — aim for 2-3L today.',
  ]

  const funFact = 'Bananas are berries, but strawberries are not.'

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNav currentPage="nutrition" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nutrition</h2>
            <p className="text-muted-foreground mt-1">
              Simple, actionable insights for your daily meals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rate Your Regional Dishes</h3>
                  <p className="text-sm text-muted-foreground">Help us personalize your recommendations</p>
                </div>
                <DishRecommendationsSection />
              </section>

              <section>
                <TipsCard tips={dailyTips} />
              </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <section>
                <ImageFoodLogger />
              </section>

              <section>
                <MacroPieChartContainer />
              </section>

              <section>
                <NutritionFactCard fact={funFact} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
