import { createContext, use, useCallback, useMemo, useSyncExternalStore, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, setTokens, clearTokens, getAccessToken, subscribeTokens } from './api'

// Types
export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  avatar_url: string | null
  bio: string
  is_active: boolean
  date_joined: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth API functions
const fetchCurrentUser = async (): Promise<User> => {
  const { data } = await api.get('/auth/me')
  return data
}

const loginUser = async (credentials: LoginCredentials) => {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

const registerUser = async (userData: RegisterData) => {
  const { data } = await api.post('/auth/register', userData)
  return data
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(subscribeTokens, getAccessToken, () => null)
  const isAuthenticated = !!accessToken
  const queryClient = useQueryClient()

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const { mutateAsync: submitLogin } = loginMutation
  const { mutateAsync: submitRegistration } = registerMutation

  // Logout function
  const logout = useCallback(() => {
    clearTokens()
    queryClient.clear()
  }, [queryClient])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await submitLogin(credentials)
    },
    [submitLogin]
  )
  const register = useCallback(
    async (data: RegisterData) => {
      await submitRegistration(data)
    },
    [submitRegistration]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user: isAuthenticated ? (user ?? null) : null,
      isLoading: isAuthenticated && isLoading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, isLoading, isAuthenticated, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export function useAuth() {
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
