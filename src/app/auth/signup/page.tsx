'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { trpc } from '@/utils/trpc'

// Import minimalist step components
import PersonalDataStep from '@/app/auth/signup/components/PersonalDataStep'
import GoalsStep from '@/app/auth/signup/components/GoalsStep'
import ActivityLevelStep from '@/app/auth/signup/components/ActivityLevelStep'
import MeasurementsStep from '@/app/auth/signup/components/MeasurementsStep'
import AccountStep from '@/app/auth/signup/components/AccountStep'

const steps = [
  { id: 0, title: 'Personal Info', component: PersonalDataStep },
  { id: 1, title: 'Goals', component: GoalsStep },
  { id: 2, title: 'Activity', component: ActivityLevelStep },
  { id: 3, title: 'Measurements', component: MeasurementsStep },
  { id: 4, title: 'Account', component: AccountStep },
]

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal data
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    // Goals
    goals: '',
    // Activity
    activityLevel: '',
    // Measurements (optional)
    waist: '',
    hips: '',
    chest: '',
    arms: '',
    // Account
    email: '',
    password: '',
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const completeSignupMutation = trpc.onboarding.completeSignupWithOnboarding.useMutation({
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify your account.')
      router.push('/auth/login?message=Please check your email to verify your account before signing in')
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong')
    }
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 0: return true
      case 1: return !!(formData.name && formData.age && formData.gender && formData.weight && formData.height)
      case 2: return !!formData.goals
      case 3: return !!formData.activityLevel
      case 4: return true // Measurements are optional
      default: return false
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await completeSignupMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        onboardingData: {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender as 'male' | 'female' | 'other',
          weight: formData.weight,
          height: formData.height,
          goals: formData.goals as any,
          activityLevel: formData.activityLevel as any,
          waist: formData.waist || undefined,
          hips: formData.hips || undefined,
          chest: formData.chest || undefined,
          arms: formData.arms || undefined,
        }
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id + 1
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-3 text-sm rounded-lg ${
            message.includes('Error') || message.includes('Could not')
              ? 'text-red-700 bg-red-50 border border-red-200'
              : 'text-green-700 bg-green-50 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Current Step Content */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={handleFinalSubmit}
              canProceed={canProceedToStep(currentStep + 1)}
              isLoading={completeSignupMutation.isPending}
              isLastStep={currentStep === steps.length - 1}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Link 
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            Already have an account?
          </Link>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToStep(currentStep + 1)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinalSubmit}
              disabled={completeSignupMutation.isPending || !formData.email || !formData.password}
              className="bg-green-600 hover:bg-green-700"
            >
              {completeSignupMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}