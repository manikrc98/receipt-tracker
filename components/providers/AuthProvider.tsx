'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateApiKey: (apiKey: string, provider?: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    'https://hsoeronoacqhkfwkbbrw.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    console.log('AuthProvider: Initializing...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check:', { session, error })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state change:', { event, session })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    // Add visible alert for debugging
    alert('DEBUG: Starting Google OAuth!')
    console.log('Starting Google OAuth with direct approach...')
    console.log('Current Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Current Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
    console.log('Window location origin:', window.location.origin)
    console.log('Auth redirect URL:', process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL)
    
    // Clear any existing auth state
    await supabase.auth.signOut()
    
    // Use environment variable for redirect URL, fallback to window.location.origin
    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || window.location.origin
    
    // Let Supabase handle the entire OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    
    if (error) {
      alert('DEBUG: OAuth Error - ' + error.message)
      console.error('Google OAuth error:', error)
      return { error }
    }
    
    alert('DEBUG: OAuth Success - ' + JSON.stringify(data))
    console.log('OAuth response:', data)
    
    // Let Supabase handle the redirect automatically
    if (data?.url) {
      alert('DEBUG: Redirecting to: ' + data.url)
      // Don't manually redirect - let Supabase handle it
      // window.location.href = data.url
    } else {
      alert('DEBUG: No redirect URL provided')
    }
    
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateApiKey = async (apiKey: string, provider = 'openai') => {
    if (!user) return { error: { message: 'User not authenticated' } }

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        ai_api_key: apiKey,
        ai_provider: provider,
        updated_at: new Date().toISOString(),
      })

    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateApiKey,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
