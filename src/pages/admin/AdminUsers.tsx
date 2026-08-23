import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
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
  business_status: string | null
  created_at: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc('admin_get_users')
    if (!error && data) {
      // Excluir al CEO de la lista — CEO no es usuario
      setUsers((data as AdminUser[]).filter(u => u.role !== 'admin'))
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true)
    const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })

    if (error || data?.error) {
      setActionLoading(false)
      return
    }

    setActionLoading(false)
    setSelectedUser(null)
    loadUsers()
  }

  const handleSuspendBusiness = async (userId: string) => {
    setActionLoading(true)
    await supabase
      .from('businesses')
      .update({ status: 'suspended' })
      .eq('owner_user_id', userId)

    await supabase.from('audit_logs').insert({
      action: 'admin_suspend_user',
      entity_type: 'user',
      metadata: { user_id: userId, action: 'suspended' },
    })

    setActionLoading(false)
    setSelectedUser(null)
    loadUsers()
  }

  const handleReactivateBusiness = async (userId: string) => {
    setActionLoading(true)
    await supabase
      .from('businesses')
      .update({ status: 'active' })
      .eq('owner_user_id', userId)

    await supabase.from('audit_logs').insert({
      action: 'admin_reactivate_user',
      entity_type: 'user',
      metadata: { user_id: userId, action: 'reactivated' },
    })

    setActionLoading(false)
    setSelectedUser(null)
    loadUsers()
  }

  const handleDeleteBusiness = async (userId: string) => {
    setActionLoading(true)
    await supabase
      .from('businesses')
      .update({ status: 'deleted' })
      .eq('owner_user_id', userId)

    await supabase.from('audit_logs').insert({
      action: 'admin_delete_user_business',
      entity_type: 'user',
      metadata: { user_id: userId, action: 'deleted' },
    })

    setActionLoading(false)
    setSelectedUser(null)
    loadUsers()
  }

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Usuarios ({users.length})</h1>
      </div>

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
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Acciones</th>
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
                      <div>
                        <span className="text-secondary-700">{user.business_name}</span>
                        {user.business_status === 'suspended' && (
                          <Badge variant="danger" className="ml-2">Suspendido</Badge>
                        )}
                        {user.business_status === 'deleted' && (
                          <Badge variant="secondary" className="ml-2">Eliminado</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-secondary-400">Sin negocio</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">Vendedor</Badge>
                  </td>
                  <td className="px-4 py-3 text-secondary-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      Gestionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de gestión de usuario */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Gestionar usuario" size="md">
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4">
              <p className="font-medium text-secondary-900">{selectedUser.full_name || selectedUser.email}</p>
              <p className="text-sm text-secondary-500">{selectedUser.email}</p>
              {selectedUser.business_name && (
                <p className="text-sm text-secondary-600 mt-1">
                  Negocio: <strong>{selectedUser.business_name}</strong> (/{selectedUser.business_slug})
                </p>
              )}
            </div>

            <div className="space-y-2">
              {selectedUser.business_name && selectedUser.business_status === 'active' && (
                <Button
                  variant="outline"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={() => handleSuspendBusiness(selectedUser.user_id)}
                >
                  ⚠️ Suspender cuenta
                </Button>
              )}

              {selectedUser.business_name && selectedUser.business_status === 'suspended' && (
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={() => handleReactivateBusiness(selectedUser.user_id)}
                >
                  ✅ Reactivar cuenta
                </Button>
              )}

              {selectedUser.business_name && selectedUser.business_status !== 'deleted' && (
                <Button
                  variant="danger"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={() => handleDeleteBusiness(selectedUser.user_id)}
                >
                  🗑️ Eliminar cuenta
                </Button>
              )}

              {selectedUser.business_status === 'deleted' && (
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={() => handleReactivateBusiness(selectedUser.user_id)}
                >
                  ♻️ Restaurar cuenta
                </Button>
              )}

              <hr className="border-secondary-200 my-2" />

              <Button
                variant="danger"
                fullWidth
                isLoading={actionLoading}
                onClick={() => handleDeleteUser(selectedUser.user_id)}
              >
                🗑️ ELIMINAR USUARIO COMPLETAMENTE
              </Button>
            </div>

            <p className="text-xs text-secondary-500">
              Suspender desactiva el negocio. Eliminar usuario borra TODO permanentemente (usuario, negocio, productos, pedidos).
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
