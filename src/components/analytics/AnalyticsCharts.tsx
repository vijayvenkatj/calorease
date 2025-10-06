'use client'

import { Card, CardContent } from '@/components/ui/card'
import { trpc } from '@/utils/trpc'
import { Loader2 } from 'lucide-react'
import AnalyticsSummaryCards from './AnalyticsSummaryCards'
import WeightTrendChart from './WeightTrendChart'
import CalorieIntakeChart from './CalorieIntakeChart'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import AnalyticsAlerts from './AnalyticsAlerts'

interface AnalyticsChartsProps {
  days?: number
}

export default function AnalyticsCharts({ 
  days = 7
}: AnalyticsChartsProps) {
  const { data: analytics, isLoading } = trpc.analytics.getAnalytics.useQuery({
    days,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Loading your analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) return null

  const { hasEnoughData } = analytics

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div>
        <AnalyticsSummaryCards analytics={analytics} />
      </div>

      {/* Alerts */}
      <AnalyticsAlerts 
        hasEnoughData={hasEnoughData}
        isDataRealistic={analytics.isDataRealistic}
        totalWeightChange={analytics.totalWeightChange}
        daysLogged={analytics.daysLogged}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend Chart */}
        <WeightTrendChart 
          weightLogs={analytics.weightLogs}
          totalWeightChange={analytics.totalWeightChange}
          days={days}
        />

        {/* Calorie Intake Chart */}
        <CalorieIntakeChart 
          dailyCalories={analytics.dailyCalories}
          avgDailyCalories={analytics.avgDailyCalories}
          goalCalories={analytics.goalCalories}
          days={days}
        />
      </div>

      {/* Recommendations */}
      {hasEnoughData && (
        <PersonalizedRecommendations analytics={analytics} />
      )}
    </div>
  )
}
