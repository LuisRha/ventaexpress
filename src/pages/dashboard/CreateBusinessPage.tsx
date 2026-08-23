import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { businessService } from '@/services/business.service'
import { slugify } from '@/utils/format'
import { APP_NAME, PROVINCES_ECUADOR } from '@/utils/constants'

// Validación del formulario
const createBusinessSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  slug: z.string().min(3, 'Mínimo 3 caracteres').max(50).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Solo letras minúsculas, números y guiones'),
  email: z.string().email('Correo no válido'),
  phone: z.string().regex(/^0[2-9][0-9]{8}$/, 'Número de 10 dígitos (ej: 0991234567)'),
  cedula: z.string().min(10, 'Cédula de 10 dígitos').max(13, 'Máximo 13 caracteres'),
  province: z.string().min(1, 'Selecciona una provincia'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().min(5, 'La dirección es requerida').max(200),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().max(300).optional().or(z.literal('')),
  whatsappNumber: z.string().regex(/^0[2-9][0-9]{8}$/, 'Número de 10 dígitos').optional().or(z.literal('')),
})

type FormData = z.infer<typeof createBusinessSchema>

const categoryOptions = [
  { value: 'ropa', label: 'Ropa y moda' },
  { value: 'tecnologia', label: 'Tecnología y electrónica' },
  { value: 'belleza', label: 'Belleza y salud' },
  { value: 'hogar', label: 'Hogar y jardín' },
  { value: 'deportes', label: 'Deportes y fitness' },
  { value: 'alimentos', label: 'Alimentos y bebidas' },
  { value: 'accesorios', label: 'Accesorios y joyería' },
  { value: 'mascotas', label: 'Mascotas' },
  { value: 'juguetes', label: 'Juguetes y niños' },
  { value: 'otros', label: 'Otros' },
]

export function CreateBusinessPage() {
  const { refreshBusiness } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: '', slug: '', email: '', phone: '', cedula: '',
      province: '', city: '', address: '', category: '',
      description: '', whatsappNumber: '',
    },
  })

  const currentSlug = watch('slug')

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const slug = slugify(e.target.value)
      setValue('slug', slug, { shouldValidate: slug.length >= 3 })
      setSlugAvailable(null)
    },
    [setValue]
  )

  const checkSlug = useCallback(async () => {
    if (!currentSlug || currentSlug.length < 3) return
    const { available } = await businessService.isSlugAvailable(currentSlug)
    setSlugAvailable(available)
  }, [currentSlug])

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    const { error } = await businessService.createBusiness({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      whatsappNumber: data.whatsappNumber || undefined,
    })

    if (error) { setServerError(error); return }

    // Guardar campos adicionales
    const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
    if (session?.user) {
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('businesses')
        .update({
          email: data.email,
          phone: data.phone,
          cedula: data.cedula,
          province: data.province,
          city: data.city,
          address: data.address,
          category: data.category,
        })
        .eq('owner_user_id', session.user.id)
    }

    await refreshBusiness()
    navigate('/dashboard', { replace: true })
  }

  const provinceOptions = PROVINCES_ECUADOR.map(p => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">VE</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Crea tu negocio</h1>
          <p className="mt-2 text-secondary-500">
            Completa tus datos para empezar a vender en {APP_NAME}
          </p>
        </div>

        {serverError && <Alert variant="error" className="mb-4">{serverError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Datos personales */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">👤 Datos personales</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Cédula / RUC" placeholder="0912345678" error={errors.cedula?.message} {...register('cedula')} />
                <Input label="Correo electrónico" type="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
              </div>
              <Input label="Teléfono / Celular" type="tel" placeholder="0991234567" error={errors.phone?.message} {...register('phone')} />
            </div>
          </Card>

          {/* Datos del negocio */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">🏪 Datos del negocio</h2>
            <div className="space-y-4">
              <Input
                label="Nombre del negocio"
                placeholder="Ej: Importadora Luis"
                error={errors.name?.message}
                {...register('name', { onChange: handleNameChange })}
              />
              <Input
                label="URL de tu negocio"
                placeholder="mi-negocio"
                error={errors.slug?.message}
                hint={
                  slugAvailable === true ? '✓ Disponible' :
                  slugAvailable === false ? '✗ Ya está en uso' :
                  currentSlug ? `ventaexpress.vercel.app/${currentSlug}` : undefined
                }
                {...register('slug', { onBlur: checkSlug })}
              />
              <Select
                label="Categoría"
                options={categoryOptions}
                placeholder="¿Qué vendes?"
                error={errors.category?.message}
                {...register('category')}
              />
              <Textarea
                label="Descripción (opcional)"
                placeholder="Describe brevemente tu negocio..."
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </Card>

          {/* Ubicación */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">📍 Ubicación</h2>
            <div className="space-y-4">
              <Select
                label="Provincia"
                options={provinceOptions}
                placeholder="Selecciona tu provincia"
                error={errors.province?.message}
                {...register('province')}
              />
              <Input label="Ciudad" placeholder="Tu ciudad" error={errors.city?.message} {...register('city')} />
              <Input label="Dirección" placeholder="Calle principal, número..." error={errors.address?.message} {...register('address')} />
            </div>
          </Card>

          {/* WhatsApp */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">📱 Contacto con clientes</h2>
            <Input
              label="WhatsApp (opcional)"
              type="tel"
              placeholder="0991234567"
              error={errors.whatsappNumber?.message}
              hint="Los clientes podrán contactarte por WhatsApp"
              {...register('whatsappNumber')}
            />
          </Card>

          {/* Plan info */}
          <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
            <p className="text-sm font-medium text-primary-800 mb-1">🎁 Plan Gratuito incluido</p>
            <p className="text-xs text-primary-700">
              2 productos, 3 imágenes por producto, pedidos ilimitados, WhatsApp.
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            disabled={slugAvailable === false}
            className="shadow-lg shadow-primary-500/25"
          >
            Crear mi negocio
          </Button>
        </form>
      </div>
    </div>
  )
}
