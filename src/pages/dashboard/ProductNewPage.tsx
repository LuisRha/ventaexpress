import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { useAuth } from '@/contexts/AuthContext'
import { productsService, type ProductLimits } from '@/services/products.service'
import { createProductSchema, type CreateProductFormData } from '@/lib/validations/product'
import { slugify } from '@/utils/format'

export function ProductNewPage() {
  const { business } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [limits, setLimits] = useState<ProductLimits | null>(null)
  const [loadingLimits, setLoadingLimits] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      benefits: '',
      price: undefined,
      previousPrice: null,
      stock: -1,
      deliveryInfo: '',
      paymentInfo: '',
    },
  })

  // Cargar límites
  useEffect(() => {
    if (!business) return
    const loadLimits = async () => {
      const { limits: l } = await productsService.getProductLimits(business.id)
      setLimits(l)
      setLoadingLimits(false)
    }
    loadLimits()
  }, [business])

  // Auto-generar slug desde nombre
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value
      const slug = slugify(name)
      if (slug.length >= 2) {
        setValue('slug', slug, { shouldValidate: true })
      }
    },
    [setValue]
  )

  const onSubmit = async (data: CreateProductFormData) => {
    if (!business) return
    setServerError(null)

    const { error } = await productsService.createProduct(business.id, {
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      benefits: data.benefits || undefined,
      price: data.price,
      previousPrice: data.previousPrice,
      stock: data.stock,
      deliveryInfo: data.deliveryInfo || undefined,
      paymentInfo: data.paymentInfo || undefined,
    })

    if (error) {
      setServerError(error)
      return
    }

    navigate('/dashboard/products', { replace: true })
  }

  if (loadingLimits) {
    return <LoadingPage />
  }

  // Si no puede crear más productos
  if (limits && !limits.canCreate) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Alert variant="warning" title="Límite alcanzado">
          Has alcanzado el máximo de {limits.maxProducts} productos de tu plan.
          Actualiza a PRO para crear hasta 10 productos.
        </Alert>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/plan">
            <Button>Ver planes</Button>
          </Link>
          <Link to="/dashboard/products">
            <Button variant="outline">Volver a productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Nuevo producto</h1>
        <p className="text-secondary-500 mt-1">
          {limits ? `${limits.currentProducts} de ${limits.maxProducts} productos creados` : 'Completa la información'}
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <Input
              label="Nombre del producto"
              placeholder="Ej: Billetera KODEX"
              error={errors.name?.message}
              {...register('name', { onChange: handleNameChange })}
            />
            <Input
              label="URL del producto"
              placeholder="billetera-kodex"
              error={errors.slug?.message}
              hint={business ? `${window.location.origin}/${business.slug}/${''} ` : undefined}
              {...register('slug')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Precio (USD)"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="19.99"
                    error={errors.price?.message}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === '' ? undefined : parseFloat(val))
                    }}
                  />
                )}
              />
              <Controller
                name="previousPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Precio anterior (opcional)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.99"
                    hint="Para mostrar descuento"
                    error={errors.previousPrice?.message}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === '' ? null : parseFloat(val))
                    }}
                  />
                )}
              />
            </div>
            <Textarea
              label="Descripción"
              placeholder="Describe tu producto..."
              error={errors.description?.message}
              {...register('description')}
            />
            <Textarea
              label="Beneficios"
              placeholder="Lista los beneficios de tu producto..."
              error={errors.benefits?.message}
              {...register('benefits')}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Entrega y pago</h2>
          <div className="space-y-4">
            <Textarea
              label="Información de entrega"
              placeholder="Ej: Envío a todo Ecuador en 3-5 días hábiles..."
              error={errors.deliveryInfo?.message}
              {...register('deliveryInfo')}
            />
            <Textarea
              label="Información de pago"
              placeholder="Ej: Pago contra entrega disponible..."
              error={errors.paymentInfo?.message}
              {...register('paymentInfo')}
            />
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Crear producto
          </Button>
          <Link to="/dashboard/products">
            <Button type="button" variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
