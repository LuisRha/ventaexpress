import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null)

    const { error } = await resetPassword(data.email)

    if (error) {
      setServerError(error)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <svg className="h-12 w-12 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-2">Revisa tu correo</h2>
        <p className="text-sm text-secondary-600 mb-4">
          Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
        </p>
        <Link to="/login">
          <Button variant="outline" fullWidth>
            Volver al login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-secondary-900">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Ingresa tu correo y te enviaremos un enlace
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Enviar enlace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500">
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Volver al login
        </Link>
      </p>
    </>
  )
}
