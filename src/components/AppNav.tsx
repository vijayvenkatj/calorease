import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, LogOut, User, LayoutDashboard, Utensils, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

interface AppNavProps {
  currentPage?: 'dashboard' | 'nutrition' | 'analytics' | 'profile'
}

export default async function AppNav({ currentPage = 'dashboard' }: AppNavProps) {
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

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter(Boolean)
      .join(' ') ||
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.given_name as string | undefined) ||
    (user.user_metadata?.preferred_username as string | undefined) ||
    'there'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="p-2 bg-emerald-500 dark:bg-emerald-600 rounded-lg transition-transform group-hover:scale-105">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                  CalorEase
                </h1>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/nutrition"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'nutrition'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  Nutrition
                </Link>
                <Link
                  href="/analytics"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'analytics'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  Profile
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
              </Link>
              
              <ThemeToggle />
              
              <form action={signOut}>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="grid grid-cols-4 h-16">
            <li>
              <Link
                href="/dashboard"
                className={`flex flex-col items-center justify-center h-full text-xs ${
                  currentPage === 'dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/nutrition"
                className={`flex flex-col items-center justify-center h-full text-xs ${
                  currentPage === 'nutrition'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Utensils className="h-5 w-5" />
                <span>Nutrition</span>
              </Link>
            </li>
            <li>
              <Link
                href="/analytics"
                className={`flex flex-col items-center justify-center h-full text-xs ${
                  currentPage === 'analytics'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className={`flex flex-col items-center justify-center h-full text-xs ${
                  currentPage === 'profile'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

