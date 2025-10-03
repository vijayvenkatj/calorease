import AppNav from '@/components/AppNav'
import WeightTracker from '@/components/analytics/WeightTracker'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'

export default async function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav currentPage="analytics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics & Progress</h2>
            <p className="text-muted-foreground mt-1">
              Track your weight and calorie trends to achieve your goals
            </p>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Weight Tracker Sidebar */}
            <div className="lg:col-span-1">
              <WeightTracker />
            </div>

            {/* Analytics Charts */}
            <div className="lg:col-span-3">
              <AnalyticsCharts days={7} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

