import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getErrorMessage } from '@/lib/api'

const registrationSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    username: z.string().min(1, 'Enter a username'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type RegistrationValues = z.infer<typeof registrationSchema>

const fields = [
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
  { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    autoComplete: 'new-password',
  },
] as const

export function RegisterPage() {
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  })
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const onSubmit = async ({ email, username, password }: RegistrationValues) => {
    try {
      await register({ email, username, password })
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError('root', { message: getErrorMessage(error) })
    }
  }

  return (
    <section className="account-page" aria-labelledby="register-heading">
      <div className="account-card">
        <h1 id="register-heading">Create your account</h1>
        <p className="account-caption">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {errors.root && (
            <p role="alert" className="account-error">
              {errors.root.message}
            </p>
          )}
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="label">
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                className="input mt-1"
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                {...registerField(field.name)}
              />
              {errors[field.name] && (
                <p id={`${field.name}-error`} role="alert" className="account-error">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  )
}
