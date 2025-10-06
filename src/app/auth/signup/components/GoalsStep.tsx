import { TrendingDown, TrendingUp, Target, Heart, Zap } from 'lucide-react'

interface FormData {
  goals?: string
}

interface GoalsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  canProceed: boolean
  isLoading: boolean
  isLastStep: boolean
}

const goalOptions = [
  {
    value: 'lose_weight',
    label: 'Lose Weight',
    description: 'Reduce body weight through calorie deficit',
    icon: TrendingDown,
  },
  {
    value: 'gain_muscle',
    label: 'Gain Muscle',
    description: 'Build lean muscle mass',
    icon: TrendingUp,
  },
  {
    value: 'maintain_weight',
    label: 'Maintain Weight',
    description: 'Keep current weight stable',
    icon: Target,
  },
  {
    value: 'improve_health',
    label: 'Improve Health',
    description: 'Focus on overall wellness',
    icon: Heart,
  },
  {
    value: 'increase_strength',
    label: 'Increase Strength',
    description: 'Build strength and performance',
    icon: Zap,
  },
]

export default function GoalsStep({ formData, updateFormData }: GoalsStepProps) {
  const handleChange = (value: string) => {
    updateFormData({ goals: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Goal</h2>
        <p className="text-gray-600 mt-2">What do you want to achieve?</p>
      </div>

      <div className="space-y-3">
        {goalOptions.map((option) => {
          const Icon = option.icon
          const isSelected = formData.goals === option.value
          
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
