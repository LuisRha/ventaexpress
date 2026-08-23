import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/format'

export function AdminPlans() {
  const [plans, setPlans] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true })

      setPlans(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Planes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id as string}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-secondary-900">{plan.name as string}</h3>
              <Badge variant={(plan.active as boolean) ? 'success' : 'secondary'}>
                {(plan.active as boolean) ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-secondary-900 mb-3">{formatPrice(plan.price as number)}<span className="text-sm font-normal text-secondary-500">/mes</span></p>
            <div className="space-y-1 text-sm text-secondary-600">
              <p>Productos: {plan.max_products as number}</p>
              <p>Imágenes: {plan.max_images_per_product as number}</p>
              <p>Storage: {plan.storage_limit_mb as number}MB</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
