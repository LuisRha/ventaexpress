import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'

interface AdminUser {
  user_id: string
  email: string
  full_name: string
  role: string
  business_name: string | null
  business_slug: string | null
  created_at: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('admin_get_users')
      if (!error && data) {
        setUsers(data as AdminUser[])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Usuarios ({users.length})</h1>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-200 bg-secondary-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Negocio</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-secondary-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-secondary-900">{user.full_name || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.business_name ? (
                      <span className="text-secondary-700">{user.business_name} <span className="text-secondary-400">/{user.business_slug}</span></span>
                    ) : (
                      <span className="text-secondary-400">Sin negocio</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-secondary-500">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
