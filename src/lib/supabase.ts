import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// En producción estas variables son obligatorias.
// En desarrollo/preview, la app carga pero las llamadas a Supabase fallarán silenciosamente.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[VentaExpress] Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no configuradas. La app funcionará en modo visual pero sin backend.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
)
