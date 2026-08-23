import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { businessService } from '@/services/business.service'
import { updateBusinessSchema, type UpdateBusinessFormData } from '@/lib/validations/business'
import { supabase } from '@/lib/supabase'
import { ALLOWED_IMAGE_TYPES } from '@/utils/constants'

export function SettingsPage() {
  const { business, refreshBusiness } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateBusinessFormData>({
    resolver: zodResolver(updateBusinessSchema),
  })

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        slug: business.slug,
        description: business.description || '',
        whatsappNumber: business.whatsappNumber || '',
      })
      setLogoPreview(business.logoUrl)
    }
  }, [business, reset])

  const onSubmit = async (data: UpdateBusinessFormData) => {
    if (!business) return
    setServerError(null)
    setSuccess(false)

    const { error } = await businessService.updateBusiness(business.id, {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      whatsappNumber: data.whatsappNumber || null,
    })

    if (error) { setServerError(error); return }
    await refreshBusiness()
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business) return

    // Validar
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setServerError('Tipo de archivo no permitido. Usa JPG, PNG o WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setServerError('El logo es demasiado grande. Máximo 2MB.')
      return
    }

    setUploading(true)
    setServerError(null)

    // Subir a storage
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `logos/${business.id}/logo-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      setServerError('Error subiendo el logo: ' + uploadError.message)
      setUploading(false)
      return
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    // Actualizar negocio
    const { error: updateError } = await businessService.updateBusiness(business.id, {
      logoUrl: urlData.publicUrl,
    })

    if (updateError) {
      setServerError(updateError)
    } else {
      setLogoPreview(urlData.publicUrl)
      await refreshBusiness()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Configuración</h1>
        <p className="text-secondary-500 mt-1">Administra la información de tu negocio</p>
      </div>

      {serverError && <Alert variant="error" className="mb-4">{serverError}</Alert>}
      {success && <Alert variant="success" className="mb-4">Cambios guardados correctamente.</Alert>}

      <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Información del negocio</h2>
          <div className="space-y-4">
            <Input label="Nombre del negocio" placeholder="Ej: Importadora Luis" error={errors.name?.message} {...register('name')} />
            <Input label="URL del negocio" placeholder="mi-negocio" error={errors.slug?.message} hint={business ? `ventaexpress.com/${business.slug}` : undefined} {...register('slug')} />
            <Textarea label="Descripción" placeholder="Describe brevemente tu negocio..." error={errors.description?.message} {...register('description')} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Contacto</h2>
          <Input label="WhatsApp" type="tel" placeholder="0991234567" error={errors.whatsappNumber?.message} hint="Número de 10 dígitos para contactar clientes" {...register('whatsappNumber')} />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-secondary-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-secondary-200">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              <p className="text-xs text-secondary-500 mt-1">JPG, PNG o WebP. Máximo 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!isDirty}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
