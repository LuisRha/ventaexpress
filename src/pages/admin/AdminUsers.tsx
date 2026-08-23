import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { supabase } from '@/lib/supabase'

export function AdminUsers() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
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
                <th className="text-left px-4 py-3 font-medium text-secondary-600">User ID</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {users.map((user) => (
                <tr key={user.id as string} className="hover:bg-secondary-50">
                  <td className="px-4 py-3 text-secondary-900 font-mono text-xs">{(user.user_id as string)?.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <Badge variant={(user.role as string) === 'admin' ? 'primary' : 'secondary'}>
                      {user.role as string}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-secondary-500">{new Date(user.created_at as string).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
