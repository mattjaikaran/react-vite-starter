import { useReducer, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getErrorMessage } from '@/lib/api'

interface RegisterFormState {
  email: string
  username: string
  password: string
  confirmPassword: string
  error: string
  isLoading: boolean
}

type RegisterFormAction =
  | { type: 'SET_EMAIL'; value: string }
  | { type: 'SET_USERNAME'; value: string }
  | { type: 'SET_PASSWORD'; value: string }
  | { type: 'SET_CONFIRM_PASSWORD'; value: string }
  | { type: 'SET_ERROR'; value: string }
  | { type: 'SET_LOADING'; value: boolean }

function registerFormReducer(state: RegisterFormState, action: RegisterFormAction): RegisterFormState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.value }
    case 'SET_USERNAME':
      return { ...state, username: action.value }
    case 'SET_PASSWORD':
      return { ...state, password: action.value }
    case 'SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.value }
    case 'SET_LOADING':
      return { ...state, isLoading: action.value }
    default:
      return state
  }
}

export default function RegisterPage() {
  const [state, dispatch] = useReducer(registerFormReducer, {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    error: '',
    isLoading: false,
  })

  const { register, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_ERROR', value: '' })

    if (state.password !== state.confirmPassword) {
      dispatch({ type: 'SET_ERROR', value: 'Passwords do not match' })
      return
    }

    if (state.password.length < 8) {
      dispatch({ type: 'SET_ERROR', value: 'Password must be at least 8 characters' })
      return
    }

    dispatch({ type: 'SET_LOADING', value: true })

    try {
      await register({ email: state.email, username: state.username, password: state.password })
      // Auto-login after registration
      await login({ email: state.email, password: state.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: getErrorMessage(err) })
    } finally {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-label="Email address"
                required
                value={state.email}
                onChange={(e) => dispatch({ type: 'SET_EMAIL', value: e.target.value })}
                className="input mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                aria-label="Username"
                required
                value={state.username}
                onChange={(e) => dispatch({ type: 'SET_USERNAME', value: e.target.value })}
                className="input mt-1"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-label="Password"
                required
                value={state.password}
                onChange={(e) => dispatch({ type: 'SET_PASSWORD', value: e.target.value })}
                className="input mt-1"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-label="Confirm Password"
                required
                value={state.confirmPassword}
                onChange={(e) => dispatch({ type: 'SET_CONFIRM_PASSWORD', value: e.target.value })}
                className="input mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={state.isLoading} className="btn-primary w-full">
            {state.isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
