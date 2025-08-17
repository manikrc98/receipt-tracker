'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/components/dashboard/Dashboard'

export default function Home() {
  const { user, loading, session } = useAuth()

  console.log('Home page - Auth state:', { user, loading, session })
  
  // Add visible alert for debugging
  if (typeof window !== 'undefined') {
    // Check URL parameters for auth debugging
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const authUser = urlParams.get('user')
    const authError = urlParams.get('error')
    const authDetails = urlParams.get('details')
    
    if (authStatus || authError) {
      alert(`DEBUG: Auth callback result - Status: ${authStatus}, User: ${authUser}, Error: ${authError}, Details: ${authDetails}`)
    } else {
      alert('DEBUG: Home page loaded - User: ' + (user?.email || 'none') + ', Loading: ' + loading)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    console.log('No user found, showing AuthPage')
    return <AuthPage />
  }

  console.log('User found, showing Dashboard:', user.email)
  return <Dashboard />
}
