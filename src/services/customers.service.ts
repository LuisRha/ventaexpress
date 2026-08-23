import { supabase } from '@/lib/supabase'
import type { Customer } from '@/types'

export const customersService = {
  async getCustomers(businessId: string): Promise<{ customers: Customer[]; error: string | null }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) return { customers: [], error: error.message }

    return {
      customers: (data || []).map((c) => ({
        id: c.id,
        businessId: c.business_id,
        firstName: c.first_name,
        secondName: c.second_name || null,
        lastName: c.last_name,
        secondLastName: c.second_last_name || null,
        phone: c.phone,
        province: c.province,
        city: c.city,
        address: c.address,
        reference: c.reference || null,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
      error: null,
    }
  },
}
