'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit2, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type FoodLog, type MealType, mealTypes } from '@/lib/db/schema'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import FoodLogEditModal from '@/components/food/FoodLogEditModal'

interface FoodLogListProps {
  date?: string // YYYY-MM-DD format
}

export default function FoodLogList({ date }: FoodLogListProps) {
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null)

  const utils = trpc.useUtils()

  const { data: logs = [], isLoading, error } = trpc.food.getLogs.useQuery({
    date: date || new Date().toISOString().split('T')[0],
  })

  const deleteLogMutation = trpc.food.deleteLog.useMutation({
    onSuccess: () => {
      toast.success('Food log deleted successfully!')
      // Invalidate and refetch
      utils.food.getLogs.invalidate()
      utils.food.getDailySummary.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete food log')
    }
  })

  const handleDelete = (logId: string) => {
    if (confirm('Are you sure you want to delete this food log?')) {
      deleteLogMutation.mutate({ id: logId })
    }
  }

  // Group logs by meal type
  const groupedLogs = logs.reduce((acc, log) => {
    const mealType = log.mealType as MealType
    if (!acc[mealType]) {
      acc[mealType] = []
    }
    acc[mealType].push(log)
    return acc
  }, {} as Record<MealType, FoodLog[]>)

  const getMealTypeDisplayName = (mealType: MealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1)
  }

  const getMealTypeIcon = (mealType: MealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    }
    return icons[mealType] || '🍽️'
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse flex-1">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-600">Failed to load food logs: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="border-gray-200 h-full flex items-center justify-center">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-2">🍽️</div>
          <p className="text-gray-600 text-sm">No food logs for today yet.</p>
          <p className="text-gray-500 text-xs">Start by logging your first meal!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {mealTypes.map((mealType) => {
        const mealLogs = groupedLogs[mealType] || []
        
        if (mealLogs.length === 0) return null

        const mealCalories = mealLogs.reduce((sum, log) => sum + Number(log.calories || 0), 0)
        const mealProtein = mealLogs.reduce((sum, log) => sum + Number(log.protein || 0), 0)

        return (
          <Card key={mealType} className="border border-gray-200 flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">{getMealTypeIcon(mealType)}</span>
                  {getMealTypeDisplayName(mealType)}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(mealCalories)} cal
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(mealProtein)}g protein
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="space-y-3">
                {mealLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{log.foodName}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.loggedAt), 'HH:mm')}
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{Number(log.calories || 0)} cal</span>
                        {Number(log.protein || 0) > 0 && (
                          <span>{Number(log.protein || 0)}g protein</span>
                        )}
                        {Number(log.carbs || 0) > 0 && (
                          <span>{Number(log.carbs || 0)}g carbs</span>
                        )}
                        {Number(log.fats || 0) > 0 && (
                          <span>{Number(log.fats || 0)}g fats</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLog(log)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(log.id)}
                        disabled={deleteLogMutation.isPending}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Edit Modal */}
      {editingLog && (
        <FoodLogEditModal
          foodLog={editingLog}
          isOpen={!!editingLog}
          onClose={() => setEditingLog(null)}
          onSuccess={() => setEditingLog(null)}
        />
      )}
    </div>
  )
}
