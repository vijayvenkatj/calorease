import AppNav from '@/components/AppNav'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNav currentPage="profile" />

      <main className="w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and wellness goals
            </p>
          </div>

          <ProfileForm />
        </div>
      </main>
    </div>
  )
}

