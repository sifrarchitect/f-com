'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/actions/auth'
import { Lock, Check, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await changePassword(formData)
      if (result.error) {
        setError(result.error)
      } else if ('success' in result) {
        setSuccess(result.success as string)
        ;(e.target as HTMLFormElement).reset()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fm-card p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Change Password</h2>
          <p className="text-xs text-muted-foreground">Update your account password</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-fm-success/10 border border-fm-success/20 text-sm text-fm-success flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current_password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current Password
          </label>
          <input
            id="current_password"
            name="current_password"
            type={showPasswords ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full h-10 px-3 mt-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="new_password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            New Password
          </label>
          <input
            id="new_password"
            name="new_password"
            type={showPasswords ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full h-10 px-3 mt-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          <p className="text-xs text-muted-foreground/60 mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirm_password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type={showPasswords ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full h-10 px-3 mt-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPasswords ? 'Hide' : 'Show'} passwords
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  )
}
