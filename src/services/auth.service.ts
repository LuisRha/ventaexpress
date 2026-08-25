import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// ============================================
// TIPOS
// ============================================

export interface SignUpData {
  email: string
  password: string
  fullName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

// ============================================
// SERVICIO DE AUTENTICACIÓN
// ============================================

export const authService = {
  /**
   * Registrar nuevo usuario.
   * Supabase Auth crea el usuario y el trigger DB asigna role 'seller'.
   */
  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    return {
      user: data.user ?? null,
      session: data.session ?? null,
      error,
    }
  },

  /**
   * Iniciar sesión con email y contraseña.
   */
  async signIn({ email, password }: SignInData): Promise<AuthResult> {
    // Rate limiting: máximo 5 intentos en 5 minutos
    const { authRateLimiter } = await import('@/lib/security')
    if (!authRateLimiter.isAllowed(email)) {
      return {
        user: null,
        session: null,
        error: { message: 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.', status: 429 } as unknown as import('@supabase/supabase-js').AuthError,
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Si login exitoso, resetear rate limiter
    if (!error && data.user) {
      authRateLimiter.reset(email)
    }

    return {
      user: data.user ?? null,
      session: data.session ?? null,
      error,
    }
  },

  /**
   * Cerrar sesión.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Solicitar recuperación de contraseña.
   * Envía email con enlace para resetear.
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  },

  /**
   * Actualizar contraseña (después de reset).
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  },

  /**
   * Obtener sesión actual.
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  /**
   * Obtener usuario actual.
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user ?? null, error }
  },

  /**
   * Suscribirse a cambios de autenticación.
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },
}
