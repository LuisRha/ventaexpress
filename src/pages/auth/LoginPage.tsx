import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  // Redirigir a la ruta original después del login (si existe)
  const from = (location.state as { from?: string })?.from || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    const { error } = await signIn(data.email, data.password)

    if (error) {
      setServerError(error)
      return
    }

    // Login exitoso — redirigir
    navigate(from, { replace: true })
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-secondary-900">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-secondary-500">Ingresa a tu cuenta</p>
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
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Regístrate gratis
        </Link>
      </p>
    </>
  )
}
