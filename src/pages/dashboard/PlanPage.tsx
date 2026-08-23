import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PayPalCheckout } from '@/components/payments/PayPalCheckout'
import { SubscriptionTimer } from '@/components/shared/SubscriptionTimer'
import { useAuth } from '@/contexts/AuthContext'
import { plansService } from '@/services/plans.service'
import type { Plan } from '@/types'
import { formatPrice } from '@/utils/format'

export function PlanPage() {
  const { business } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    const load = async () => {
      const { plans: data } = await plansService.getActivePlans()
      setPlans(data)

      if (business?.planId) {
        const { plan } = await plansService.getCurrentPlan(business.planId)
        setCurrentPlan(plan)
      }
      setLoading(false)
    }
    load()
  }, [business])

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price === 0) return
    setSelectedPlan(plan)
  }

  if (loading) return <LoadingSpinner className="py-12" />

  const planFeatures: Record<string, string[]> = {
    free: ['2 productos', '3 imágenes por producto', 'Pedidos ilimitados', 'WhatsApp', 'Branding VentaExpress'],
    pro: ['5 productos', '5 imágenes por producto', 'Pedidos ilimitados', 'WhatsApp', 'Gestión de clientes', 'Branding VentaExpress'],
    premium: ['10 productos', '5 imágenes por producto', 'Pedidos ilimitados', 'WhatsApp', 'Sin branding', 'Gestión de clientes', 'Dashboard avanzado'],
    enterprise: ['20 productos', '5 imágenes por producto', 'Pedidos ilimitados', 'WhatsApp', 'Sin branding', 'Gestión de clientes', 'Dashboard avanzado', 'Soporte prioritario', 'Analíticas'],
  }

  return (
    <div>
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-secondary-900">Mi Plan</h1>
        <p className="text-secondary-500 text-sm">Administra tu suscripción</p>
      </div>

      {/* Plan actual */}
      {currentPlan && (
        <Card className="mb-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-secondary-900">Plan {currentPlan.name}</h2>
                <Badge variant="success">Activo</Badge>
              </div>
              <p className="text-sm text-secondary-600">
                {currentPlan.maxProducts} productos, {currentPlan.maxImagesPerProduct} imágenes por producto
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-secondary-900">{formatPrice(currentPlan.price)}<span className="text-sm font-normal text-secondary-500">/mes</span></p>
            </div>
          </div>
          <SubscriptionTimer businessId={business?.id || ''} />
        </Card>
      )}

      {message && (
        <Alert variant="info" className="mb-6">{message}</Alert>
      )}

      {/* Grid de planes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id
          const features = planFeatures[plan.slug] || []
          const isPopular = plan.slug === 'premium'

          return (
            <Card
              key={plan.id}
              className={`flex flex-col relative ${isPopular ? 'ring-2 ring-primary-600 shadow-lg' : ''} ${isCurrentPlan ? 'bg-primary-50/50' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-secondary-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-secondary-900">{formatPrice(plan.price)}</span>
                  <span className="text-secondary-500 text-sm">/mes</span>
                </div>
                <p className="text-sm text-primary-600 font-medium mt-1">
                  {plan.maxProducts} productos
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-secondary-700">
                    <svg className="h-4 w-4 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button variant="outline" fullWidth disabled>
                  Plan actual
                </Button>
              ) : plan.price === 0 ? (
                <Button variant="outline" fullWidth disabled>
                  Plan gratuito
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant={isPopular ? 'primary' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Seleccionar {plan.name}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Modal de pago */}
      {selectedPlan && (
        <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={`Pagar Plan ${selectedPlan.name}`} size="md">
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <p className="text-sm text-secondary-600">Plan {selectedPlan.name}</p>
              <p className="text-3xl font-bold text-secondary-900">{formatPrice(selectedPlan.price)}<span className="text-sm font-normal text-secondary-500">/mes</span></p>
              <p className="text-sm text-secondary-500 mt-1">{selectedPlan.maxProducts} productos, {selectedPlan.maxImagesPerProduct} imágenes</p>
            </div>

            <PayPalCheckout
              planId={selectedPlan.id}
              planName={selectedPlan.name}
              amount={selectedPlan.price.toFixed(2)}
              businessId={business?.id || ''}
              onSuccess={() => {
                setSelectedPlan(null)
                setMessage(`¡Plan ${selectedPlan.name} activado correctamente!`)
                setTimeout(() => window.location.reload(), 1500)
              }}
            />

            <p className="text-xs text-secondary-500 text-center">
              Pago seguro procesado por PayPal.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
