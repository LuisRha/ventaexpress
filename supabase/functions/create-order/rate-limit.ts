// ============================================
// RATE LIMITING PARA EDGE FUNCTIONS
// ============================================
// Límites:
// - 5 pedidos por teléfono por hora
// - 10 pedidos por IP por hora

// En producción se usaría Upstash Redis o Deno KV.
// Esta implementación usa un Map en memoria (se resetea al re-deploy).

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

export function checkOrderRateLimit(phone: string, ip: string): { allowed: boolean; reason?: string } {
  const HOUR = 60 * 60 * 1000

  // Límite por teléfono: 5 pedidos/hora
  if (!checkRateLimit(`phone:${phone}`, 5, HOUR)) {
    return { allowed: false, reason: 'Demasiados pedidos desde este número. Intenta en 1 hora.' }
  }

  // Límite por IP: 10 pedidos/hora
  if (!checkRateLimit(`ip:${ip}`, 10, HOUR)) {
    return { allowed: false, reason: 'Demasiados pedidos. Intenta más tarde.' }
  }

  return { allowed: true }
}
