import { useCallback } from 'react'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { usePayPal } from '@/hooks/usePayPal'
import { supabase } from '@/lib/supabase'

interface PayPalCheckoutProps {
  planId: string
  planName: string
  amount: string
  businessId: string
  onSuccess: () => void
}

export function PayPalCheckout({ planId, planName, amount, businessId, onSuccess }: PayPalCheckoutProps) {
  const handlePaymentSuccess = useCallback(async (details: Record<string, unknown>) => {
    // SOLO activar si el pago fue COMPLETADO exitosamente
    const status = (details as { status?: string }).status
    if (status !== 'COMPLETED') {
      console.error('Pago no completado:', status)
      return
    }

    // Activar plan en la base de datos
    await supabase
      .from('businesses')
      .update({ plan_id: planId })
      .eq('id', businessId)

    // Registrar pago
    await supabase.from('payments').insert({
      business_id: businessId,
      provider: 'paypal',
      provider_payment_id: (details as { id?: string }).id || `pp_${Date.now()}`,
      amount: parseFloat(amount),
      currency: 'USD',
      status: 'completed',
      payment_type: 'subscription',
    })

    // Audit log
    await supabase.from('audit_logs').insert({
      business_id: businessId,
      action: 'plan_upgraded',
      entity_type: 'subscription',
      metadata: { plan: planName, amount, paypal_id: (details as { id?: string }).id },
    })

    onSuccess()
  }, [planId, planName, amount, businessId, onSuccess])

  const { loading, error } = usePayPal(
    'paypal-buttons',
    amount,
    `Plan ${planName} - VentaExpress`,
    handlePaymentSuccess
  )

  return (
    <div>
      {error && <Alert variant="error" className="mb-3">{error}</Alert>}
      {loading && <LoadingSpinner className="py-4" />}
      <div id="paypal-buttons" className="min-h-[50px]"></div>
    </div>
  )
}
