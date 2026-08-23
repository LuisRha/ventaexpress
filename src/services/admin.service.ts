import { supabase } from '@/lib/supabase'

// ============================================
// SERVICIO DE ADMINISTRACIÓN
// ============================================

export const adminService = {
  async getStats() {
    // Obtener IDs de admins para excluirlos
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    const adminIds = (admins || []).map(a => a.user_id)

    const [users, businesses, products, orders, payments] = await Promise.all([
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).neq('status', 'deleted').not('owner_user_id', 'in', `(${adminIds.join(',')})`),
      supabase.from('products').select('*', { count: 'exact', head: true }).neq('status', 'deleted'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'completed'),
    ])

    const totalRevenue = (payments.data || []).reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      totalUsers: users.count || 0,
      totalBusinesses: businesses.count || 0,
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalRevenue,
    }
  },

  async getBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, plans (name, slug), user_roles!businesses_owner_user_id_fkey (role)')
      .order('created_at', { ascending: false })

    return { businesses: data || [], error: error?.message || null }
  },

  async suspendBusiness(businessId: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ status: 'suspended' })
      .eq('id', businessId)
    return { error: error?.message || null }
  },

  async reactivateBusiness(businessId: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ status: 'active' })
      .eq('id', businessId)
    return { error: error?.message || null }
  },

  async changePlan(businessId: string, planId: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ plan_id: planId })
      .eq('id', businessId)
    return { error: error?.message || null }
  },

  async getAuditLogs(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    return { logs: data || [], error: error?.message || null }
  },

  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, businesses (name, slug)')
      .order('created_at', { ascending: false })
      .limit(100)

    return { payments: data || [], error: error?.message || null }
  },
}
