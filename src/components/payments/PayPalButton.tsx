import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'

interface PayPalButtonProps {
  planName: string
  amount: string  // Ej: "5.00"
  onSuccess: (details: Record<string, unknown>) => void
  onCancel?: () => void
}

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''

export function PayPalPaymentButton({ planName, amount, onSuccess, onCancel }: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null)

  if (!clientId) {
    return <Alert variant="warning">PayPal no está configurado. Contacta al administrador.</Alert>
  }

  return (
    <div className="w-full">
      {error && <Alert variant="error" className="mb-3">{error}</Alert>}

      <PayPalScriptProvider options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
      }}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
            height: 45,
          }}
          createOrder={(_data, actions) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                description: `Plan ${planName} - VentaExpress`,
                amount: {
                  currency_code: 'USD',
                  value: amount,
                },
              }],
            })
          }}
          onApprove={async (_data, actions) => {
            if (!actions.order) return
            const details = await actions.order.capture()
            onSuccess(details as unknown as Record<string, unknown>)
          }}
          onCancel={() => {
            if (onCancel) onCancel()
          }}
          onError={(err) => {
            setError('Error procesando el pago. Intenta nuevamente.')
            console.error('PayPal error:', err)
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}
