import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { APP_NAME } from '@/utils/constants'

// Hook para animar números contando hacia arriba
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

function CounterItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(target)
  return (
    <div className="text-center" ref={ref}>
      <p className="text-2xl sm:text-3xl font-bold text-white">{count.toLocaleString()}{suffix}</p>
      <p className="text-xs sm:text-sm text-white/60">{label}</p>
    </div>
  )
}

export function LandingPage() {
  const [totalViews, setTotalViews] = useState<number>(500)

  // Registrar visita y obtener total de vistas
  const registerView = useCallback(async () => {
    try {
      // Incrementar contador de visitas
      const { data } = await supabase.rpc('increment_page_views', { page_name: 'landing' })
      if (data && typeof data === 'number') {
        setTotalViews(data)
      } else {
        // Fallback: intentar leer directamente
        const { data: row } = await supabase
          .from('page_views')
          .select('view_count')
          .eq('page', 'landing')
          .single()
        if (row?.view_count) setTotalViews(row.view_count)
      }
    } catch {
      // Si falla, usar valor por defecto
    }
  }, [])

  useEffect(() => {
    registerView()
  }, [registerView])
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-20 sm:py-28 lg:py-36">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container-app text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-white/90">+500 vendedores activos en Ecuador</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Vende tus productos
            <br />
            <span className="text-yellow-300">desde cualquier red social</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Crea una landing profesional para cada producto, comparte el link en TikTok, Facebook o WhatsApp y recibe pedidos al instante. Pago contra entrega.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 text-base bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl shadow-lg shadow-yellow-400/30 border-0">
                Crear mi tienda gratis
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="px-8 py-4 text-base rounded-xl border-white/30 text-white hover:bg-white/10">
                Ver cómo funciona
              </Button>
            </a>
          </div>
          <p className="mt-5 text-sm text-white/50">
            Sin tarjeta de crédito. Listo en 2 minutos.
          </p>

          {/* Social proof - Animated counters */}
          <div className="mt-14 flex items-center justify-center gap-6 sm:gap-10">
            <CounterItem target={totalViews} suffix="" label="Visitas" />
            <div className="h-8 w-px bg-white/20" />
            <CounterItem target={500} suffix="+" label="Vendedores" />
            <div className="h-8 w-px bg-white/20" />
            <CounterItem target={15000} suffix="+" label="Pedidos" />
            <div className="h-8 w-px bg-white/20" />
            <CounterItem target={98} suffix="%" label="Satisfacción" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-white">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">Simple y rápido</p>
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
                color: 'from-violet-500 to-purple-600',
                shadow: 'shadow-violet-500/30',
              },
              {
                step: '2',
                icon: '🔗',
                title: 'Comparte el enlace',
                description: 'Copia tu enlace y compártelo en TikTok, Facebook, Instagram, WhatsApp o cualquier red social.',
                color: 'from-pink-500 to-rose-600',
                shadow: 'shadow-pink-500/30',
              },
              {
                step: '3',
                icon: '🛒',
                title: 'Recibe pedidos',
                description: 'Tus clientes completan el formulario y el pedido llega a tu panel. Confirma por WhatsApp.',
                color: 'from-emerald-500 to-green-600',
                shadow: 'shadow-emerald-500/30',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} text-white text-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
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
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900">Todo lo que necesitas para vender</h2>
            <p className="mt-4 text-secondary-600 max-w-lg mx-auto">
              No necesitas una plataforma de e-commerce completa. Solo lo esencial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📱', title: 'Landing por producto', desc: 'Cada producto tiene su propia página profesional optimizada para móvil y redes sociales.', accent: 'border-l-violet-500' },
              { icon: '💰', title: 'Pago contra entrega', desc: 'Tus clientes pagan al recibir. Sin pasarelas, sin comisiones, sin complicaciones.', accent: 'border-l-emerald-500' },
              { icon: '💬', title: 'WhatsApp integrado', desc: 'Contacta a tus clientes directamente por WhatsApp con un solo click desde el panel.', accent: 'border-l-green-500' },
              { icon: '📦', title: 'Panel de pedidos', desc: 'Administra pedidos, clientes y productos desde un panel simple e intuitivo.', accent: 'border-l-blue-500' },
              { icon: '🚀', title: 'Optimizado para redes', desc: 'Links que se ven profesionales al compartir en TikTok, Facebook, Instagram y más.', accent: 'border-l-pink-500' },
              { icon: '💎', title: 'Precio accesible', desc: 'Empieza gratis hoy. Plan PRO desde $5/mes cuando tu negocio crezca.', accent: 'border-l-amber-500' },
            ].map((feature) => (
              <div key={feature.title} className={`p-6 rounded-xl bg-white border border-secondary-200 border-l-4 ${feature.accent} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
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
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">Precios</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900">Planes transparentes</h2>
            <p className="mt-4 text-secondary-600">
              Empieza gratis, escala cuando estés listo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Gratis */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-secondary-200 bg-white hover:shadow-xl transition-shadow">
              <div className="mb-5">
                <h3 className="text-base font-bold text-secondary-900">Gratis</h3>
                <p className="text-xs text-secondary-500 mt-1">Para empezar</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-secondary-900">$0</span>
                  <span className="text-secondary-500 text-sm ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {['2 productos', '3 fotos por producto', 'Landing básica', 'Formulario de pedido', 'Panel básico'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-secondary-700">
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" fullWidth className="py-3 rounded-xl text-xs font-bold border-2">
                  Empezar gratis
                </Button>
              </Link>
            </div>

            {/* Básico $5 */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-blue-400 bg-gradient-to-b from-blue-50 to-white hover:shadow-xl transition-shadow relative">
              <div className="mb-5">
                <h3 className="text-base font-bold text-secondary-900">Básico</h3>
                <p className="text-xs text-secondary-500 mt-1">Para vendedores activos</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-blue-600">$5</span>
                  <span className="text-secondary-500 text-sm ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {['5 productos', '5 fotos por producto', 'Landing profesional', 'Formulario de pedido', 'WhatsApp integrado', 'Panel de clientes'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-secondary-700">
                    <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button fullWidth className="py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700">
                  Elegir Básico
                </Button>
              </Link>
            </div>

            {/* PRO $10 */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-50 to-white relative shadow-xl shadow-violet-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-2xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Popular
                </span>
              </div>
              <div className="mb-5">
                <h3 className="text-base font-bold text-secondary-900">PRO</h3>
                <p className="text-xs text-secondary-500 mt-1">Para negocios en crecimiento</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">$10</span>
                  <span className="text-secondary-500 text-sm ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {['10 productos', '10 fotos por producto', 'Landings avanzadas', 'Formulario de pedido', 'WhatsApp integrado', 'Panel completo', 'Base de clientes', 'Sin branding'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-secondary-700">
                    <svg className="h-4 w-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button fullWidth className="py-3 rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  Elegir PRO
                </Button>
              </Link>
            </div>

            {/* Premium $15 */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white hover:shadow-xl transition-shadow">
              <div className="mb-5">
                <h3 className="text-base font-bold text-secondary-900">Premium</h3>
                <p className="text-xs text-secondary-500 mt-1">Para empresas serias</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-amber-600">$15</span>
                  <span className="text-secondary-500 text-sm ml-1">/mes</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {['Productos ilimitados', '15 fotos por producto', 'Landings premium', 'Formulario avanzado', 'WhatsApp integrado', 'Panel completo', 'Clientes ilimitados', 'Sin branding', 'Soporte prioritario'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-secondary-700">
                    <svg className="h-4 w-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button fullWidth className="py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white border-0">
                  Elegir Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white">
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
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="flex text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-2xs text-white/50">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400/20 rounded-full blur-3xl" />
        </div>
        <div className="container-app text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Empieza a vender hoy mismo
          </h2>
          <p className="text-white/80 max-w-md mx-auto mb-8 text-base sm:text-lg">
            Crea tu primera landing de venta en minutos. Sin conocimientos técnicos. Sin riesgo.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-10 py-4 text-base bg-white text-gray-900 hover:bg-gray-100 rounded-xl shadow-xl font-bold border-0">
              Crear mi tienda gratis
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/60">
            Únete a más de 500 vendedores en Ecuador
          </p>
        </div>
      </section>
    </>
  )
}

void APP_NAME
