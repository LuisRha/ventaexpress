import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

export function RegisterPage() {
  const { signUp } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)

    const { error } = await signUp(data.email, data.password, data.fullName)

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
          <svg className="h-12 w-12 text-success-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-2">Cuenta creada</h2>
        <p className="text-sm text-secondary-600 mb-4">
          Revisa tu correo electrónico para confirmar tu cuenta.
        </p>
        <Link to="/login">
          <Button variant="outline" fullWidth>
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-secondary-900">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-secondary-500">Empieza a vender en minutos</p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Tu nombre"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          hint={!errors.password ? 'Mayúscula, minúscula y número' : undefined}
          {...register('password')}
        />

        <p className="text-xs text-secondary-500">
          Al registrarte aceptas nuestros{' '}
          <a href="#" className="text-primary-600 hover:underline">términos de servicio</a>
          {' '}y{' '}
          <a href="#" className="text-primary-600 hover:underline">política de privacidad</a>.
        </p>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Crear cuenta gratis
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Ingresar
        </Link>
      </p>
    </>
  )
}
