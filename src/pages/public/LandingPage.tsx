import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { APP_NAME } from '@/utils/constants'

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="container-app text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
            Crea páginas de venta
            <br />
            <span className="text-primary-600">para tus productos</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-secondary-600 max-w-2xl mx-auto">
            Recibe pedidos directamente desde TikTok, Facebook, Instagram y WhatsApp.
            Sin complicaciones. Sin costos altos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg">
                Crear mi página gratis
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg">
                Cómo funciona
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-secondary-500">
            Sin tarjeta de crédito. Plan gratuito disponible.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 sm:py-20 bg-secondary-50">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900">¿Cómo funciona?</h2>
            <p className="mt-3 text-secondary-600 max-w-lg mx-auto">
              En tres simples pasos tendrás tu página lista para vender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Crea tu producto',
                description: 'Sube fotos, agrega precio, descripción y beneficios. Tu página se genera automáticamente.',
              },
              {
                step: '2',
                title: 'Comparte el enlace',
                description: 'Copia tu enlace y compártelo en TikTok, Facebook, Instagram, WhatsApp o cualquier red social.',
              },
              {
                step: '3',
                title: 'Recibe pedidos',
                description: 'Tus clientes completan el formulario y el pedido llega directamente a tu panel. Confirma por WhatsApp.',
              },
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{item.title}</h3>
                <p className="text-sm text-secondary-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900">Todo lo que necesitas</h2>
            <p className="mt-3 text-secondary-600 max-w-lg mx-auto">
              No necesitas pagar una plataforma completa de e-commerce para vender un producto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Páginas individuales', desc: 'Cada producto tiene su propia página profesional optimizada para móvil.' },
              { title: 'Pago contra entrega', desc: 'Tus clientes pagan al recibir el producto. Sin complicaciones de pagos online.' },
              { title: 'WhatsApp integrado', desc: 'Contacta a tus clientes directamente por WhatsApp con un solo click.' },
              { title: 'Panel de pedidos', desc: 'Administra todos tus pedidos desde un panel simple e intuitivo.' },
              { title: 'Optimizado para redes', desc: 'Comparte tus enlaces en TikTok, Facebook, Instagram y más.' },
              { title: 'Bajo costo', desc: 'Empieza gratis. Plan PRO desde $5/mes cuando necesites más.' },
            ].map((feature) => (
              <div key={feature.title} className="p-5 rounded-xl border border-secondary-200 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                <h4 className="font-semibold text-secondary-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-secondary-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-16 sm:py-20 bg-secondary-50">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900">Planes simples</h2>
            <p className="mt-3 text-secondary-600">
              Empieza gratis, crece cuando estés listo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Gratis</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-secondary-900">$0</span>
                  <span className="text-secondary-500 ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  '2 productos',
                  '5 fotos por producto',
                  'Página individual',
                  'Formulario de pedido',
                  'WhatsApp',
                  'Panel básico',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-secondary-700">
                    <svg className="h-4 w-4 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" fullWidth>
                  Empezar gratis
                </Button>
              </Link>
            </Card>

            {/* PRO */}
            <Card className="flex flex-col ring-2 ring-primary-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">PRO</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-secondary-900">$5</span>
                  <span className="text-secondary-500 ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  '10 productos',
                  '5 fotos por producto',
                  'Páginas individuales',
                  'Formulario de pedido',
                  'WhatsApp',
                  'Panel completo',
                  'Clientes',
                  'Sin branding',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-secondary-700">
                    <svg className="h-4 w-4 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button fullWidth>
                  Empezar con PRO
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Empieza a vender hoy
          </h2>
          <p className="text-secondary-600 max-w-md mx-auto mb-8">
            Crea tu primera página de venta en minutos. Sin conocimientos técnicos necesarios.
          </p>
          <Link to="/register">
            <Button size="lg">
              Crear mi página gratis
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}

// Suppress unused variable warning for APP_NAME in build
void APP_NAME
