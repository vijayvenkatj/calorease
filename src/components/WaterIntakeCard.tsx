'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Droplet, Plus } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

interface WaterIntakeCardProps {
  currentMl: number
  goalMl: number
  className?: string
}

export default function WaterIntakeCard({ currentMl: initialMl, goalMl, className }: WaterIntakeCardProps) {
  const [currentMl, setCurrentMl] = useState(initialMl)
  const utils = trpc.useUtils()
  
  const addWaterMutation = trpc.water.addLog.useMutation({
    onSuccess: (data) => {
      setCurrentMl(prev => prev + data.amountMl)
      utils.water.getTotalForDate.invalidate()
      toast.success(`Added ${data.amountMl}ml of water!`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add water intake')
    },
  })

  const handleQuickAdd = (amount: number) => {
    addWaterMutation.mutate({ amountMl: amount })
  }

  const percent = Math.max(0, Math.min(100, Math.round((currentMl / Math.max(goalMl, 1)) * 100)))

  return (
    <Card className={`border-border bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-blue-600/10 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-blue-900/30 hover:shadow-md transition-shadow ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Droplet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <CardTitle className="text-base">Water Intake</CardTitle>
          </div>
          <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{percent}%</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {currentMl.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground ml-1">ml</span>
          </div>
          <p className="text-sm text-muted-foreground">
            of {goalMl.toLocaleString()}ml goal
          </p>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => handleQuickAdd(250)}
            disabled={addWaterMutation.isPending}
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            250ml
          </Button>
          <Button
            onClick={() => handleQuickAdd(500)}
            disabled={addWaterMutation.isPending}
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            500ml
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
