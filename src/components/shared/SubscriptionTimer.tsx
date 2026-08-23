import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Alert } from '@/components/ui/Alert'

interface SubscriptionTimerProps {
  businessId: string
}

export function SubscriptionTimer({ businessId }: SubscriptionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
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
        setEndDate(new Date(data.subscription_end))
      }
      setLoading(false)
    }
    load()
  }, [businessId])

  // Countdown timer que actualiza cada segundo
  useEffect(() => {
    if (!endDate) return

    const update = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  if (loading || !timeLeft) return null

  // Expirado
  if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0) {
    return (
      <Alert variant="error" className="mt-2 py-1 px-3">
        Tu plan ha expirado. Renueva ahora.
      </Alert>
    )
  }

  // Últimos 3 días
  if (timeLeft.days <= 3) {
    return (
      <div className="mt-2 bg-red-50 border border-red-200 rounded px-3 py-1.5 inline-flex items-center gap-2">
        <span className="text-xs font-bold text-red-700">⚠️ Vence en</span>
        <span className="font-mono text-sm font-bold text-red-800">
          {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    )
  }

  // Últimos 7 días
  if (timeLeft.days <= 7) {
    return (
      <div className="mt-2 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 inline-flex items-center gap-2">
        <span className="text-xs font-medium text-amber-700">⏰</span>
        <span className="font-mono text-sm font-bold text-amber-800">
          {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-xs text-amber-600">restantes</span>
      </div>
    )
  }

  // Normal
  return (
    <div className="mt-2 bg-orange-50 border border-orange-200 rounded px-3 py-1.5 inline-flex items-center gap-2">
      <span className="text-xs text-orange-700">📅</span>
      <span className="font-mono text-sm font-bold text-orange-800">
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-xs text-orange-600">restantes</span>
    </div>
  )
}
