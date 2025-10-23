import { useState } from 'react'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormData {
  email?: string
  password?: string
}

interface AccountStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  canProceed: boolean
  isLoading: boolean
  isLastStep: boolean
}

const passwordRequirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /\d/, text: 'One number' },
]

export default function AccountStep({ formData, updateFormData, onSubmit, isLoading }: AccountStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  console.log(onSubmit,isLoading)

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  const getPasswordStrength = (password: string) => {
    return passwordRequirements.filter(req => req.regex.test(password)).length
  }

  const passwordStrength = getPasswordStrength(formData.password || '')
  const passwordsMatch = formData.password === confirmPassword
  // const canSubmit = formData.email && formData.password && passwordStrength === 4 && passwordsMatch


  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Almost done! Create your CalorEase account</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="mt-1 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password requirements */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-600">Password requirements:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <CheckCircle 
                      className={`h-3 w-3 ${
                        req.regex.test(formData.password || '') 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`} 
                    />
                    <span className={
                      req.regex.test(formData.password || '') 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1"
          />
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          🎉 You&apos;re all set! Click &quot;Create Account&quot; to start your wellness journey with CalorEase.
        </p>
      </div>
    </div>
  )
}
