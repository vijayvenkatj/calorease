import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface FormData {
  waist?: string
  hips?: string
  chest?: string
  arms?: string
}

interface MeasurementsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  canProceed: boolean
  isLoading: boolean
  isLastStep: boolean
}

export default function MeasurementsStep({ formData, updateFormData, onNext }: MeasurementsStepProps) {
  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  const handleSkip = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Body Measurements</h2>
        <p className="text-gray-600 mt-2">Optional measurements for better tracking</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Optional:</strong> These measurements help track progress beyond just weight. 
          You can skip this step or add them later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="waist">Waist (cm)</Label>
          <Input
            id="waist"
            type="number"
            placeholder="80"
            value={formData.waist}
            onChange={(e) => handleChange('waist', e.target.value)}
            min="40"
            max="200"
            step="0.1"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="hips">Hips (cm)</Label>
          <Input
            id="hips"
            type="number"
            placeholder="90"
            value={formData.hips}
            onChange={(e) => handleChange('hips', e.target.value)}
            min="40"
            max="200"
            step="0.1"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="chest">Chest (cm)</Label>
          <Input
            id="chest"
            type="number"
            placeholder="95"
            value={formData.chest}
            onChange={(e) => handleChange('chest', e.target.value)}
            min="40"
            max="200"
            step="0.1"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="arms">Arms (cm)</Label>
          <Input
            id="arms"
            type="number"
            placeholder="30"
            value={formData.arms}
            onChange={(e) => handleChange('arms', e.target.value)}
            min="15"
            max="100"
            step="0.1"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleSkip}
          className="text-gray-600 hover:text-gray-800"
        >
          Skip this step
        </Button>
      </div>
    </div>
  )
}
