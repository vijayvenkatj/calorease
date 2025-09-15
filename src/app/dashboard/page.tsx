import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CalorEase</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.user_metadata?.first_name || user.email}!
              </span>
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Welcome to your CalorEase dashboard!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Calories</CardTitle>
                <CardDescription>Track your daily caloric intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">0</div>
                <p className="text-sm text-gray-600">out of 2000 calories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>Your nutrition journey this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">5/7</div>
                <p className="text-sm text-gray-600">days on track</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Foods</CardTitle>
                <CardDescription>Quick access to common meals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">12</div>
                <p className="text-sm text-gray-600">foods saved</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Welcome to CalorEase! Here's how to make the most of your nutrition tracking journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">📱 Log Your Meals</h4>
                  <p className="text-sm text-green-700">
                    Start by logging what you eat throughout the day. Our database has thousands of foods to choose from.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Set Your Goals</h4>
                  <p className="text-sm text-blue-700">
                    Define your daily calorie and nutrition goals based on your lifestyle and objectives.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">📊 Track Progress</h4>
                  <p className="text-sm text-purple-700">
                    Monitor your daily and weekly progress with detailed charts and insights.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">🍽️ Discover Recipes</h4>
                  <p className="text-sm text-orange-700">
                    Explore healthy recipes that fit your nutritional goals and preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
