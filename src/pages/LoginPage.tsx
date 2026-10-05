import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getErrorMessage } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})
type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (
    location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null
  )?.from
  const pathname = destination?.pathname
  const from =
    pathname?.startsWith('/') && !pathname.startsWith('//') && pathname !== '/login'
      ? `${pathname}${destination?.search ?? ''}${destination?.hash ?? ''}`
      : '/dashboard'

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      setError('root', { message: getErrorMessage(error) })
    }
  }

  return (
    <section className="account-page" aria-labelledby="login-heading">
      <div className="account-card">
        <h1 id="login-heading">Sign in to your account</h1>
        <p className="account-caption">
          Or <Link to="/register">create a new account</Link>
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {errors.root && (
            <p role="alert" className="account-error">
              {errors.root.message}
            </p>
          )}
          <div>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input mt-1"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="account-error">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input mt-1"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="account-error">
                {errors.password.message}
              </p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  )
}
