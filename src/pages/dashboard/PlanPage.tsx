import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function PlanPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Mi Plan</h1>
        <p className="text-secondary-500 mt-1">Administra tu suscripción</p>
      </div>

      {/* Current plan */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-secondary-900">Plan Gratuito</h2>
              <Badge variant="success">Activo</Badge>
            </div>
            <p className="text-sm text-secondary-500">
              2 productos, 5 imágenes por producto
            </p>
          </div>
          <Button>Upgrade a PRO</Button>
        </div>
      </Card>

      {/* Plans comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary-200 bg-primary-50/30">
          <h3 className="font-semibold text-secondary-900 mb-1">Gratis</h3>
          <p className="text-3xl font-bold text-secondary-900 mb-4">$0<span className="text-sm font-normal text-secondary-500">/mes</span></p>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li>2 productos</li>
            <li>5 imágenes por producto</li>
            <li>Pedidos ilimitados</li>
            <li>WhatsApp</li>
            <li className="text-secondary-400">Branding VentaExpress</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold text-secondary-900 mb-1">PRO</h3>
          <p className="text-3xl font-bold text-secondary-900 mb-4">$5<span className="text-sm font-normal text-secondary-500">/mes</span></p>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li>10 productos</li>
            <li>5 imágenes por producto</li>
            <li>Pedidos ilimitados</li>
            <li>WhatsApp</li>
            <li>Sin branding</li>
            <li>Clientes</li>
          </ul>
          <Button className="mt-4" fullWidth>
            Seleccionar PRO
          </Button>
        </Card>
      </div>
    </div>
  )
}
