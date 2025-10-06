import { Armchair, Footprints, Bike, Zap, Flame } from 'lucide-react'

interface FormData {
  activityLevel?: string
}

interface ActivityLevelStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  canProceed: boolean
  isLoading: boolean
  isLastStep: boolean
}

const activityOptions = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
    icon: Armchair,
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: Footprints,
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: Bike,
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    icon: Zap,
  },
  {
    value: 'extra_active',
    label: 'Extra Active',
    description: 'Very hard exercise or physical job',
    icon: Flame,
  },
]

export default function ActivityLevelStep({ formData, updateFormData }: ActivityLevelStepProps) {
  const handleChange = (value: string) => {
    updateFormData({ activityLevel: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Activity Level</h2>
        <p className="text-gray-600 mt-2">How active are you typically?</p>
      </div>

      <div className="space-y-3">
        {activityOptions.map((option) => {
          const Icon = option.icon
          const isSelected = formData.activityLevel === option.value
          
          return (
            <div
              key={option.value}
              className={`
                relative cursor-pointer rounded-lg p-4 border-2 transition-all
                ${isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }
              `}
              onClick={() => handleChange(option.value)}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
