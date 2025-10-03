import { Leaf } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Minimalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 relative">
        <div className="flex flex-col justify-center items-center p-12 text-white w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold">CalorEase</h1>
          </div>
          <p className="text-lg text-center max-w-sm text-green-100">
            Your simple nutrition companion for a healthier lifestyle.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
