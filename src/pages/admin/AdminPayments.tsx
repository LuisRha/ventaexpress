import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { adminService } from '@/services/admin.service'
import { formatPrice, formatDateTime } from '@/utils/format'

export function AdminPayments() {
  const [payments, setPayments] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { payments: data } = await adminService.getPayments()
      setPayments(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pagos</h1>
      {payments.length === 0 ? (
        <Card>
          <EmptyState title="Sin pagos registrados" description="Los pagos aparecerán aquí cuando se integre la pasarela." />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-secondary-200 bg-secondary-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Negocio</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {payments.map((p) => (
                  <tr key={p.id as string}>
                    <td className="px-4 py-3 text-secondary-900">
                      {(p.businesses as Record<string, string>)?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.amount as number)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={(p.status as string) === 'completed' ? 'success' : 'warning'}>
                        {p.status as string}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary-500">{formatDateTime(p.created_at as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
