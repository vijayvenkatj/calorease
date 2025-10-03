import AppNav from '@/components/AppNav'
import FoodLogger from '@/components/food/FoodLogger'
import FoodLogList from '@/components/food/FoodLogList'
import NutritionSummary from '@/components/food/NutritionSummary'
import ImageFoodLogger from '@/components/food/ImageFoodLogger'
import DashboardStats from '@/components/DashboardStats'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              Track your nutrition and achieve your wellness goals
            </p>
          </div>

          <DashboardStats />

          {/* Nutrition Summary */}
          <NutritionSummary />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Food Logger - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <FoodLogger />
              <ImageFoodLogger />
            </div>

            {/* Food Log List - Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Today's Food Log</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <FoodLogList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
