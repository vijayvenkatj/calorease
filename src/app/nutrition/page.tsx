import AppNav from '@/components/AppNav'
import MealSuggestionCard, { MealSuggestion } from '@/components/nutrition/MealSuggestionCard'
import TipsCard from '@/components/nutrition/TipsCard'
import NutritionFactCard from '@/components/nutrition/NutritionFactCard'
import MacroPieChartContainer from '@/components/nutrition/MacroPieChartContainer'

export default async function NutritionPage() {
  // Placeholder/demo data; replace with real queries later
  const suggestions: MealSuggestion[] = [
    {
      id: '1',
      name: 'Grilled Chicken Bowl',
      imageUrl: '/vercel.svg',
      calories: 520,
      macros: { protein: 42, carbs: 48, fats: 16 },
    },
    {
      id: '2',
      name: 'Mediterranean Salad',
      imageUrl: '/globe.svg',
      calories: 380,
      macros: { protein: 18, carbs: 34, fats: 20 },
    },
    {
      id: '3',
      name: 'Tofu Veggie Stir-fry',
      imageUrl: '/window.svg',
      calories: 450,
      macros: { protein: 25, carbs: 55, fats: 12 },
    },
  ]

  const dailyTips = [
    'Add a serving of high-fiber veggies to lunch.',
    'Prioritize lean protein at dinner to support recovery.',
    'Stay hydrated — aim for 2–3L today.',
  ]

  const funFact = 'Bananas are berries, but strawberries are not.'

  return (
    <div className="min-h-screen bg-background">
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
                  <h3 className="text-lg font-semibold">AI Meal Suggestions</h3>
                  <p className="text-sm text-muted-foreground">Curated for your goals</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((meal) => (
                    <MealSuggestionCard key={meal.id} meal={meal} />
                  ))}
                </div>
              </section>

              <section>
                <TipsCard tips={dailyTips} />
              </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
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
