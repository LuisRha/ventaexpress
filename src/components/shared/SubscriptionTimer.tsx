import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Alert } from '@/components/ui/Alert'

interface SubscriptionTimerProps {
  businessId: string
}

export function SubscriptionTimer({ businessId }: SubscriptionTimerProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    const load = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('subscription_end')
        .eq('id', businessId)
        .single()

      if (data?.subscription_end) {
        const end = new Date(data.subscription_end)
        const now = new Date()
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        setDaysLeft(diff)
      }
      setLoading(false)
    }
    load()
  }, [businessId])

  if (loading || daysLeft === null) return null

  // Expirado
  if (daysLeft <= 0) {
    return (
      <Alert variant="error" className="mt-3">
        Tu plan ha expirado. Renueva para mantener tus productos activos.
      </Alert>
    )
  }

  // Últimos 3 días — urgente
  if (daysLeft <= 3) {
    return (
      <div className="mt-3 bg-danger-50 border border-danger-200 rounded-lg p-3">
        <p className="text-sm font-bold text-danger-700">⚠️ Tu plan vence en {daysLeft} día{daysLeft > 1 ? 's' : ''}!</p>
        <p className="text-xs text-danger-600">Renueva ahora para no perder acceso a tus productos.</p>
      </div>
    )
  }

  // Últimos 7 días — advertencia
  if (daysLeft <= 7) {
    return (
      <div className="mt-3 bg-warning-50 border border-warning-500/20 rounded-lg p-3">
        <p className="text-sm font-medium text-warning-700">⏰ Te quedan {daysLeft} días de tu plan</p>
        <p className="text-xs text-warning-600">Recuerda renovar antes de que expire.</p>
      </div>
    )
  }

  // Normal — mostrar días restantes
  return (
    <div className="mt-2 bg-orange-50 border border-orange-200 rounded px-3 py-1.5">
      <p className="text-xs font-semibold text-orange-700">📅 {daysLeft} días restantes — Vence el {new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</p>
    </div>
  )
}
