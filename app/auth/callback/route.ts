import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Use the request origin for redirect
  const baseUrl = origin

  console.log('Auth callback received:', { code, error, errorDescription, origin })
  
  // Add visible debugging
  console.log('DEBUG: Auth callback starting...')

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${baseUrl}?error=${error}`)
  }

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${baseUrl}?error=session_exchange_failed&details=${exchangeError.message}`)
      }
      
      console.log('Session exchange successful:', data)
      
      // Get the user session to verify it's set
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session verification error:', sessionError)
        return NextResponse.redirect(`${baseUrl}?error=session_verification_failed&details=${sessionError.message}`)
      }
      
      if (!session) {
        console.error('No session found after exchange')
        return NextResponse.redirect(`${baseUrl}?error=no_session`)
      }
      
      console.log('Session verified:', session.user.email)
      
      // Add session info to URL for debugging
      return NextResponse.redirect(`${baseUrl}?auth=success&user=${session.user.email}`)
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${baseUrl}?error=unexpected_error&details=${err}`)
    }
  }

  // If no code, redirect to main app
  return NextResponse.redirect(baseUrl)
}
