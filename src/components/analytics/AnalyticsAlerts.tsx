'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface AnalyticsAlertsProps {
  hasEnoughData: boolean
  isDataRealistic?: boolean
  totalWeightChange: number
  daysLogged: number
}

export default function AnalyticsAlerts({ 
  hasEnoughData, 
  isDataRealistic, 
  totalWeightChange, 
  daysLogged 
}: AnalyticsAlertsProps) {
  if (hasEnoughData && isDataRealistic !== false) return null

  return (
    <div className="space-y-4">
      {/* Not Enough Data Warning */}
      {!hasEnoughData && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 animate-in fade-in slide-in-from-top-2 duration-500">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                  More Data Needed
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  You need at least <strong>7 days of calorie logs</strong> and <strong>2 weight entries</strong> for accurate calculations.
                  Keep logging to get personalized recommendations!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Warning */}
      {hasEnoughData && isDataRealistic === false && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 animate-in fade-in slide-in-from-top-2 duration-500">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-300" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                  ⚠️ Data Quality Warning
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                  Your weight change of <strong>{totalWeightChange} kg</strong> over <strong>{daysLogged} days</strong> seems unusually large. 
                  This could be due to:
                </p>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-300 space-y-1.5 ml-2">
                  <li>Incorrect weight entry (typo)</li>
                  <li>Water weight fluctuation</li>
                  <li>Scale calibration issues</li>
                  <li>Inconsistent weighing conditions</li>
                </ul>
                <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-900 dark:text-red-200">
                    <strong>Note:</strong> The calculations are using your average intake as maintenance. 
                    Please verify your weight entries for accuracy.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

