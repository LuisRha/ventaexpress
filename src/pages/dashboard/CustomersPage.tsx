import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { customersService } from '@/services/customers.service'
import type { Customer } from '@/types'

export function CustomersPage() {
  const { business } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    const load = async () => {
      const { customers: data } = await customersService.getCustomers(business.id)
      setCustomers(data)
      setLoading(false)
    }
    load()
  }, [business])

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Clientes</h1>
        <p className="text-secondary-500 mt-1">{customers.length} clientes registrados</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="Sin clientes" description="Los clientes aparecerán aquí cuando recibas pedidos." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-secondary-200 bg-secondary-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600 hidden sm:table-cell">Ciudad</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600 hidden md:table-cell">Provincia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-secondary-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-4 py-3 text-secondary-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-secondary-600 hidden sm:table-cell">{customer.city}</td>
                    <td className="px-4 py-3 text-secondary-600 hidden md:table-cell">{customer.province}</td>
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
