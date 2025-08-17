'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/components/dashboard/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}
