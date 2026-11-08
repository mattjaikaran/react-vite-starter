import { createContext, use, useCallback, useMemo, useSyncExternalStore, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authGetCurrentUserOptions,
  authGetCurrentUserQueryKey,
  authLoginMutation,
  authRegisterMutation,
} from '@/api/generated/@tanstack/react-query.gen'
import type { LoginRequest, RegisterRequest, User } from '@/api/generated'
import { setTokens, clearTokens, getAccessToken, subscribeTokens } from './api'

export type { User }

// Types
export type LoginCredentials = LoginRequest
export type RegisterData = RegisterRequest

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(subscribeTokens, getAccessToken, () => null)
  const isAuthenticated = !!accessToken
  const queryClient = useQueryClient()

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    ...authGetCurrentUserOptions(),
    enabled: isAuthenticated,
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    ...authLoginMutation(),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: authGetCurrentUserQueryKey() })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    ...authRegisterMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authGetCurrentUserQueryKey() })
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
      await submitLogin({ body: credentials })
    },
    [submitLogin]
  )
  const register = useCallback(
    async (data: RegisterData) => {
      await submitRegistration({ body: data })
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
