import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PersonalDataStepProps {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  canProceed: boolean
  isLoading: boolean
  isLastStep: boolean
}

export default function PersonalDataStep({ formData, updateFormData, onNext, canProceed }: PersonalDataStepProps) {
  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canProceed) onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
        <p className="text-gray-600 mt-2">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              required
              min="13"
              max="120"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
              className="mt-1 w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              required
              min="20"
              max="500"
              step="0.1"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              required
              min="100"
              max="250"
              step="0.1"
              className="mt-1"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
