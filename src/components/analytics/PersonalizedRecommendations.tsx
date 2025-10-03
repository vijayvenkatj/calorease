'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Lightbulb, TrendingUp, Activity } from 'lucide-react'

// Helper function to get goal display text
function getGoalDisplayText(goal: string): string {
  switch (goal) {
    case 'lose_weight':
      return 'Lose Weight'
    case 'gain_muscle':
      return 'Gain Muscle'
    case 'maintain_weight':
      return 'Maintain Weight'
    case 'improve_health':
      return 'Improve Health'
    case 'increase_strength':
      return 'Increase Strength'
    default:
      return 'Unknown Goal'
  }
}

interface PersonalizedRecommendationsProps {
  analytics: {
    maintenanceCalories: number
    goalCalories: number
    userGoal: string
    targetWeeklyWeightChange: number
  }
}

export default function PersonalizedRecommendations({ analytics }: PersonalizedRecommendationsProps) {
  return (
    <Card className="border-border bg-gradient-to-br from-emerald-500/5 to-green-500/5 dark:from-emerald-900/10 dark:to-green-900/10 hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
            <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Maintenance Calories */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 mt-0.5">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-foreground">Your Maintenance Calories</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Based on your data, your maintenance calories are approximately{' '}
                <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.maintenanceCalories} cal/day</span>.
                This is the amount needed to maintain your current weight.
              </p>
            </div>
          </div>
        </div>

        {/* Goal Recommendation */}
        <div className="p-4 rounded-xl bg-card border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 mt-0.5">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-foreground">
                Your Goal: {getGoalDisplayText(analytics.userGoal)}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analytics.targetWeeklyWeightChange !== 0 ? (
                  <>
                    To achieve your target of{' '}
                    <span className="font-bold text-foreground">
                      {analytics.targetWeeklyWeightChange > 0 ? '+' : ''}{analytics.targetWeeklyWeightChange} kg/week
                    </span>,{' '}
                    aim for <span className="font-bold text-emerald-600 dark:text-emerald-400">{analytics.goalCalories} calories per day</span>.
                  </>
                ) : (
                  <>
                    To maintain your current weight, aim for{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{analytics.goalCalories} calories per day</span>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 mt-0.5">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 text-foreground">Pro Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Safe and sustainable weight loss is typically 0.5-1 kg per week. 
                Rapid weight changes may include water weight. Consistency is key for long-term success!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

