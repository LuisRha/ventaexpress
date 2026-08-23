import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminService } from '@/services/admin.service'

export function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { businesses: data } = await adminService.getBusinesses()
    setBusinesses(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSuspend = async (id: string) => {
    await adminService.suspendBusiness(id)
    load()
  }

  const handleReactivate = async (id: string) => {
    await adminService.reactivateBusiness(id)
    load()
  }

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Negocios</h1>
      <div className="space-y-3">
        {businesses.map((biz) => (
          <Card key={biz.id as string}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-secondary-900">{biz.name as string}</span>
                  <Badge variant={(biz.status as string) === 'active' ? 'success' : 'danger'}>
                    {biz.status as string}
                  </Badge>
                  <Badge variant="secondary">{(biz.plans as Record<string, string>)?.name || 'Sin plan'}</Badge>
                </div>
                <p className="text-sm text-secondary-500">/{biz.slug as string}</p>
              </div>
              <div className="flex gap-2">
                {(biz.status as string) === 'active' ? (
                  <Button size="sm" variant="danger" onClick={() => handleSuspend(biz.id as string)}>
                    Suspender
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={() => handleReactivate(biz.id as string)}>
                    Reactivar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
