import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/utils/constants'

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 sm:py-28 lg:py-36">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl" />
        </div>

        <div className="container-app text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary-200 rounded-full px-4 py-1.5 shadow-sm mb-8">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-secondary-700">+500 vendedores activos en Ecuador</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary-900 leading-[1.1] tracking-tight">
            Vende tus productos
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">desde cualquier red social</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
            Crea una landing profesional para cada producto, comparte el link en TikTok, Facebook o WhatsApp y recibe pedidos al instante. Pago contra entrega.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 text-base shadow-lg shadow-primary-500/25 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl">
                Crear mi tienda gratis
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="px-8 py-4 text-base rounded-xl border-secondary-300">
                Ver cómo funciona
              </Button>
            </a>
          </div>
          <p className="mt-5 text-sm text-secondary-400">
            Sin tarjeta de crédito. Listo en 2 minutos.
          </p>

          {/* Social proof */}
          <div className="mt-14 flex items-center justify-center gap-6 sm:gap-10 opacity-60">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary-900">500+</p>
              <p className="text-xs sm:text-sm text-secondary-500">Vendedores</p>
            </div>
            <div className="h-8 w-px bg-secondary-200" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary-900">15k+</p>
              <p className="text-xs sm:text-sm text-secondary-500">Pedidos</p>
            </div>
            <div className="h-8 w-px bg-secondary-200" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary-900">98%</p>
              <p className="text-xs sm:text-sm text-secondary-500">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-white">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">Simple y rápido</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900">¿Cómo funciona?</h2>
            <p className="mt-4 text-secondary-600 max-w-lg mx-auto">
              En tres simples pasos tendrás tu página lista para vender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                icon: '🎨',
                title: 'Crea tu producto',
                description: 'Sube fotos, agrega precio, colores, opciones y beneficios. Tu landing se genera automáticamente.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '2',
                icon: '🔗',
                title: 'Comparte el enlace',
                description: 'Copia tu enlace y compártelo en TikTok, Facebook, Instagram, WhatsApp o cualquier red social.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                step: '3',
                icon: '🛒',
                title: 'Recibe pedidos',
                description: 'Tus clientes completan el formulario y el pedido llega a tu panel. Confirma por WhatsApp.',
                color: 'from-green-500 to-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} text-white text-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <span className="absolute top-0 right-1/2 translate-x-12 -translate-y-1 text-6xl font-bold text-secondary-100 pointer-events-none">{item.step}</span>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">{item.title}</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-secondary-50 to-white">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900">Todo lo que necesitas para vender</h2>
            <p className="mt-4 text-secondary-600 max-w-lg mx-auto">
              No necesitas una plataforma de e-commerce completa. Solo lo esencial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📱', title: 'Landing por producto', desc: 'Cada producto tiene su propia página profesional optimizada para móvil y redes sociales.', accent: 'bg-blue-50 border-blue-100' },
              { icon: '💰', title: 'Pago contra entrega', desc: 'Tus clientes pagan al recibir. Sin pasarelas, sin comisiones, sin complicaciones.', accent: 'bg-green-50 border-green-100' },
              { icon: '💬', title: 'WhatsApp integrado', desc: 'Contacta a tus clientes directamente por WhatsApp con un solo click desde el panel.', accent: 'bg-emerald-50 border-emerald-100' },
              { icon: '📦', title: 'Panel de pedidos', desc: 'Administra pedidos, clientes y productos desde un panel simple e intuitivo.', accent: 'bg-purple-50 border-purple-100' },
              { icon: '🚀', title: 'Optimizado para redes', desc: 'Links que se ven profesionales al compartir en TikTok, Facebook, Instagram y más.', accent: 'bg-orange-50 border-orange-100' },
              { icon: '💎', title: 'Precio accesible', desc: 'Empieza gratis hoy. Plan PRO desde $5/mes cuando tu negocio crezca.', accent: 'bg-amber-50 border-amber-100' },
            ].map((feature) => (
              <div key={feature.title} className={`p-6 rounded-2xl border ${feature.accent} hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h4 className="font-bold text-secondary-900 mb-1.5">{feature.title}</h4>
                <p className="text-sm text-secondary-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-20 sm:py-28 bg-white">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">Precios</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900">Planes transparentes</h2>
            <p className="mt-4 text-secondary-600">
              Empieza gratis, escala cuando estés listo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="flex flex-col p-8 rounded-2xl border border-secondary-200 bg-white hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-secondary-900">Gratis</h3>
                <p className="text-sm text-secondary-500 mt-1">Para empezar a vender</p>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-secondary-900">$0</span>
                  <span className="text-secondary-500 ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-3.5 flex-1 mb-8">
                {[
                  '2 productos',
                  '5 fotos por producto',
                  'Landing profesional',
                  'Formulario de pedido',
                  'Contacto WhatsApp',
                  'Panel básico',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-secondary-700">
                    <svg className="h-5 w-5 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" fullWidth className="py-3 rounded-xl text-sm font-semibold">
                  Empezar gratis
                </Button>
              </Link>
            </div>

            {/* PRO */}
            <div className="flex flex-col p-8 rounded-2xl border-2 border-primary-500 bg-gradient-to-b from-primary-50/50 to-white relative shadow-xl shadow-primary-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  Recomendado
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-secondary-900">PRO</h3>
                <p className="text-sm text-secondary-500 mt-1">Para negocios en crecimiento</p>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-secondary-900">$5</span>
                  <span className="text-secondary-500 ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-3.5 flex-1 mb-8">
                {[
                  '10 productos',
                  '5 fotos por producto',
                  'Landings profesionales',
                  'Formulario de pedido',
                  'Contacto WhatsApp',
                  'Panel completo',
                  'Base de clientes',
                  'Sin branding de VentaXpres',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-secondary-700">
                    <svg className="h-5 w-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button fullWidth className="py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/25 bg-gradient-to-r from-primary-600 to-primary-700">
                  Empezar con PRO
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-16 sm:py-20 bg-secondary-900 text-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Lo que dicen nuestros vendedores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'María G.', city: 'Quito', text: 'Empecé a vender billeteras por TikTok y en una semana ya tenía 20 pedidos. Súper fácil de usar.' },
              { name: 'Carlos R.', city: 'Guayaquil', text: 'Antes usaba solo WhatsApp para vender. Ahora con VentaXpres todo es más organizado y profesional.' },
              { name: 'Ana P.', city: 'Cuenca', text: 'El pago contra entrega es perfecto para Ecuador. Mis clientes confían más y yo vendo más.' },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-sm text-secondary-200 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-2xs text-secondary-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        <div className="container-app text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Empieza a vender hoy mismo
          </h2>
          <p className="text-primary-100 max-w-md mx-auto mb-8 text-base sm:text-lg">
            Crea tu primera landing de venta en minutos. Sin conocimientos técnicos. Sin riesgo.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-10 py-4 text-base bg-white text-primary-700 hover:bg-primary-50 rounded-xl shadow-xl font-bold">
              Crear mi tienda gratis
            </Button>
          </Link>
          <p className="mt-4 text-sm text-primary-200">
            Únete a más de 500 vendedores en Ecuador
          </p>
        </div>
      </section>
    </>
  )
}

void APP_NAME
