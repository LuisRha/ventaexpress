import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { authService } from '@/services/auth.service'
import { businessService } from '@/services/business.service'
import type { Business, UserRole } from '@/types'

// ============================================
// TIPOS
// ============================================

interface AuthContextType {
  // Estado
  user: User | null
  session: Session | null
  business: Business | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  hasBusiness: boolean

  // Acciones
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshBusiness: () => Promise<void>
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del negocio y rol del usuario
  const loadUserData = useCallback(async () => {
    try {
      const [businessResult, roleResult] = await Promise.all([
        businessService.getMyBusiness(),
        businessService.getUserRole(),
      ])

      setBusiness(businessResult.business)
      setRole((roleResult.role as UserRole) ?? 'seller')
    } catch {
      setBusiness(null)
      setRole('seller')
    }
  }, [])

  // Refrescar datos del negocio (después de crear negocio)
  const refreshBusiness = useCallback(async () => {
    const { business: biz } = await businessService.getMyBusiness()
    setBusiness(biz)
  }, [])

  // Inicializar sesión y escuchar cambios
  useEffect(() => {
    let mounted = true

    // Obtener sesión inicial
    const initSession = async () => {
      try {
        const { session: currentSession } = await authService.getSession()

        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await loadUserData()
        }
      } catch {
        // Error obteniendo sesión — limpiar estado
        setSession(null)
        setUser(null)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initSession()

    // Listener de cambios de auth
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserData()
        }

        if (event === 'SIGNED_OUT') {
          setBusiness(null)
          setRole(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserData])

  // ==========================================
  // ACCIONES
  // ==========================================

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await authService.signUp({ email, password, fullName })

    if (error) {
      return { error: translateAuthError(error.message) }
    }

    return { error: null }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await authService.signIn({ email, password })

    if (error) {
      return { error: translateAuthError(error.message) }
    }

    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
    setSession(null)
    setBusiness(null)
    setRole(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await authService.resetPassword(email)

    if (error) {
      return { error: translateAuthError(error.message) }
    }

    return { error: null }
  }, [])

  // ==========================================
  // VALOR DEL CONTEXT
  // ==========================================

  const value: AuthContextType = {
    user,
    session,
    business,
    role,
    isAuthenticated: !!session,
    isLoading,
    isAdmin: role === 'admin',
    hasBusiness: !!business,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshBusiness,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

// ============================================
// HELPER: Traducir errores de Supabase Auth
// ============================================

function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu correo electrónico.',
    'User already registered': 'Ya existe una cuenta con este correo.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Signup requires a valid password': 'La contraseña no es válida.',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
    'For security purposes, you can only request this after': 'Demasiados intentos. Espera unos minutos.',
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value
    }
  }

  return 'Ha ocurrido un error. Intenta nuevamente.'
}
