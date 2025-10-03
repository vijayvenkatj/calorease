'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scale, Plus } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'

export default function WeightTracker() {
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  
  const utils = trpc.useUtils()

  const addWeightMutation = trpc.analytics.addWeightLog.useMutation({
    onSuccess: () => {
      toast.success('Weight logged successfully!')
      setWeight('')
      setNotes('')
      utils.analytics.getWeightLogs.invalidate()
      utils.analytics.getAnalytics.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log weight')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!weight || isNaN(Number(weight))) {
      toast.error('Please enter a valid weight')
      return
    }

    addWeightMutation.mutate({
      weight,
      notes: notes || undefined,
    })
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-base">Log Weight</CardTitle>
        </div>
        <CardDescription>Track your daily weight</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="500"
              placeholder="70.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Morning weight, after workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
          </div>

          <Button
            type="submit"
            disabled={addWeightMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {addWeightMutation.isPending ? 'Logging...' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Log Weight
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

