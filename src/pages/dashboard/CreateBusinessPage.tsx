import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { businessService } from '@/services/business.service'
import { createBusinessSchema, type CreateBusinessFormData } from '@/lib/validations/business'
import { slugify } from '@/utils/format'
import { APP_NAME } from '@/utils/constants'

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
  } = useForm<CreateBusinessFormData>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      whatsappNumber: '',
    },
  })

  const currentSlug = watch('slug')

  // Generar slug automáticamente desde el nombre
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value
      const slug = slugify(name)
      setValue('slug', slug, { shouldValidate: slug.length >= 3 })
      setSlugAvailable(null)
    },
    [setValue]
  )

  // Verificar disponibilidad del slug
  const checkSlug = useCallback(async () => {
    if (!currentSlug || currentSlug.length < 3) return

    const { available } = await businessService.isSlugAvailable(currentSlug)
    setSlugAvailable(available)
  }, [currentSlug])

  const onSubmit = async (data: CreateBusinessFormData) => {
    setServerError(null)

    const { error } = await businessService.createBusiness({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      whatsappNumber: data.whatsappNumber || undefined,
    })

    if (error) {
      setServerError(error)
      return
    }

    // Refrescar datos del negocio en el context
    await refreshBusiness()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">VE</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Crea tu negocio</h1>
          <p className="mt-2 text-secondary-500">
            Configura tu negocio en {APP_NAME} para empezar a vender
          </p>
        </div>

        {serverError && (
          <Alert variant="error" className="mb-4">
            {serverError}
          </Alert>
        )}

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Nombre del negocio */}
            <Input
              label="Nombre del negocio"
              placeholder="Ej: Importadora Luis"
              error={errors.name?.message}
              {...register('name', {
                onChange: handleNameChange,
              })}
            />

            {/* Slug / URL */}
            <div>
              <Input
                label="URL de tu negocio"
                placeholder="mi-negocio"
                error={errors.slug?.message}
                hint={
                  slugAvailable === true
                    ? '✓ Disponible'
                    : slugAvailable === false
                    ? '✗ Esta URL ya está en uso'
                    : currentSlug
                    ? `Tu URL será: ventaexpress.com/${currentSlug}`
                    : undefined
                }
                {...register('slug', {
                  onBlur: checkSlug,
                })}
              />
            </div>

            {/* Descripción */}
            <Textarea
              label="Descripción (opcional)"
              placeholder="Describe brevemente tu negocio..."
              error={errors.description?.message}
              {...register('description')}
            />

            {/* WhatsApp */}
            <Input
              label="WhatsApp (opcional)"
              type="tel"
              placeholder="0991234567"
              error={errors.whatsappNumber?.message}
              hint="Número de 10 dígitos para contactar clientes"
              {...register('whatsappNumber')}
            />

            {/* Info plan gratuito */}
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm font-medium text-primary-800 mb-1">Plan Gratuito incluido</p>
              <p className="text-xs text-primary-700">
                2 productos, 5 imágenes por producto, pedidos ilimitados, WhatsApp.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              disabled={slugAvailable === false}
            >
              Crear mi negocio
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
