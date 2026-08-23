import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminService } from '@/services/admin.service'
import { formatDateTime } from '@/utils/format'

export function AdminLogs() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { logs: data } = await adminService.getAuditLogs()
      setLogs(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Logs de Auditoría</h1>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-200 bg-secondary-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Acción</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Entidad</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600 hidden md:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {logs.map((log) => (
                <tr key={log.id as string} className="hover:bg-secondary-50">
                  <td className="px-4 py-3 text-secondary-600 whitespace-nowrap">
                    {formatDateTime(log.created_at as string)}
                  </td>
                  <td className="px-4 py-3 font-medium text-secondary-900">{log.action as string}</td>
                  <td className="px-4 py-3 text-secondary-600">{log.entity_type as string || '—'}</td>
                  <td className="px-4 py-3 text-secondary-500 hidden md:table-cell">{(log.ip_address as string) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
