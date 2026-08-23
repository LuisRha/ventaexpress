// ============================================
// UTILIDADES DE SEGURIDAD
// ============================================

/**
 * Rate limiter simple basado en localStorage.
 * Para producción se usaría rate limiting en Edge Functions con KV store.
 */
export class RateLimiter {
  private prefix: string
  private maxAttempts: number
  private windowMs: number

  constructor(prefix: string, maxAttempts: number, windowMs: number) {
    this.prefix = prefix
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const storageKey = `${this.prefix}_${key}`
    const now = Date.now()

    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '{"attempts":[],"blocked":0}')

      // Si está bloqueado y no ha pasado el tiempo
      if (data.blocked && now < data.blocked) {
        return false
      }

      // Limpiar intentos fuera de la ventana
      data.attempts = (data.attempts as number[]).filter((t: number) => now - t < this.windowMs)

      if (data.attempts.length >= this.maxAttempts) {
        // Bloquear
        data.blocked = now + this.windowMs
        localStorage.setItem(storageKey, JSON.stringify(data))
        return false
      }

      // Registrar intento
      data.attempts.push(now)
      data.blocked = 0
      localStorage.setItem(storageKey, JSON.stringify(data))
      return true
    } catch {
      return true
    }
  }

  reset(key: string): void {
    localStorage.removeItem(`${this.prefix}_${key}`)
  }
}

// Rate limiters preconfigurados
export const orderRateLimiter = new RateLimiter('order_rl', 5, 60 * 1000) // 5 pedidos por minuto
export const authRateLimiter = new RateLimiter('auth_rl', 5, 5 * 60 * 1000) // 5 intentos en 5 min

/**
 * Sanitizar texto de entrada (prevenir XSS básico).
 * React ya escapa por defecto, pero esto es una capa extra para datos que se guardan.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Validar que un UUID tiene formato correcto.
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
