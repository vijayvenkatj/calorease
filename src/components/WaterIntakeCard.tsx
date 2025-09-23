import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplet } from 'lucide-react'

interface WaterIntakeCardProps {
  currentMl: number
  goalMl: number
  className?: string
}

export default function WaterIntakeCard({ currentMl, goalMl, className }: WaterIntakeCardProps) {
  const percent = Math.max(0, Math.min(100, Math.round((currentMl / Math.max(goalMl, 1)) * 100)))

  return (
    <Card className={`bg-gradient-to-r from-teal-400 to-blue-600 text-white border-0 overflow-hidden ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            <CardTitle className="text-white">Water Intake</CardTitle>
          </div>
          <div className="text-sm font-semibold">{percent}%</div>
        </div>
        <CardDescription className="!text-white/90">
          {currentMl.toLocaleString()}ml / {goalMl.toLocaleString()}ml
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-2.5 w-full bg-white/30 rounded-full">
          <div
            className="h-2.5 bg-white rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}


