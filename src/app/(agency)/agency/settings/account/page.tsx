import { getUser } from '@/lib/auth'
import ChangePasswordForm from '@/components/shared/ChangePasswordForm'
import { User } from 'lucide-react'

export default async function AgencyAccountPage() {
  const user = await getUser()
  if (!user) return null

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="fm-card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">Your account information</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="text-sm mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
            <p className="text-sm mt-1 capitalize">{user.role?.replace('_', ' ') || 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <ChangePasswordForm />
    </div>
  )
}
