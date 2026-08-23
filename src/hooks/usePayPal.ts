import { useEffect, useState, useRef } from 'react'

const PAYPAL_CLIENT_ID = 'AeI43wyKUL9y88HU3UYPuuIDNBuRkJmhUKi4vJJBXL-WK1wiXBYRNNlmVWqADireX6GNmwxU_P0SbaHW'

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (selector: string) => void }
    }
  }
}

export function usePayPal(
  containerId: string,
  amount: string,
  description: string,
  onSuccess: (details: Record<string, unknown>) => void
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const rendered = useRef(false)

  useEffect(() => {
    rendered.current = false
    setLoading(true)
    setError(null)

    const renderButtons = () => {
      const container = document.getElementById(containerId)
      if (!container || rendered.current || !window.paypal) return

      container.innerHTML = ''

      try {
        window.paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 45 },
          createOrder: (_data: unknown, actions: { order: { create: (opts: Record<string, unknown>) => Promise<string> } }) => {
            return actions.order.create({
              purchase_units: [{
                description,
                amount: { currency_code: 'USD', value: amount },
              }],
            })
          },
          onApprove: async (_data: unknown, actions: { order: { capture: () => Promise<Record<string, unknown>> } }) => {
            const details = await actions.order.capture()
            onSuccess(details)
          },
          onError: (err: unknown) => {
            setError('Error con PayPal. Intenta nuevamente.')
            console.error('PayPal error:', err)
          },
        }).render(`#${containerId}`)

        rendered.current = true
        setLoading(false)
      } catch {
        setError('No se pudo cargar PayPal.')
        setLoading(false)
      }
    }

    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]')

    if (existingScript && window.paypal) {
      renderButtons()
    } else if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
      script.async = true
      script.onload = () => setTimeout(renderButtons, 100)
      script.onerror = () => {
        setError('No se pudo cargar PayPal.')
        setLoading(false)
      }
      document.head.appendChild(script)
    } else {
      existingScript.addEventListener('load', () => setTimeout(renderButtons, 100))
    }

    return () => { rendered.current = false }
  }, [containerId, amount, description, onSuccess])

  return { loading, error }
}
