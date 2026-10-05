import { useReducer, FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { api, getErrorMessage } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Alert, Input, Image } from '@/components/ui'

interface ProfileFormState {
  firstName: string
  lastName: string
  bio: string
  error: string
  success: string
}

type ProfileFormAction =
  | { type: 'SET_FIRST_NAME'; value: string }
  | { type: 'SET_LAST_NAME'; value: string }
  | { type: 'SET_BIO'; value: string }
  | { type: 'SET_ERROR'; value: string }
  | { type: 'SET_SUCCESS'; value: string }

function profileFormReducer(state: ProfileFormState, action: ProfileFormAction): ProfileFormState {
  switch (action.type) {
    case 'SET_FIRST_NAME':
      return { ...state, firstName: action.value }
    case 'SET_LAST_NAME':
      return { ...state, lastName: action.value }
    case 'SET_BIO':
      return { ...state, bio: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.value, success: '' }
    case 'SET_SUCCESS':
      return { ...state, success: action.value, error: '' }
    default:
      return state
  }
}

export function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [state, dispatch] = useReducer(profileFormReducer, {
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    bio: user?.bio || '',
    error: '',
    success: '',
  })

  const updateProfile = useMutation({
    mutationFn: async (data: { first_name: string; last_name: string; bio: string }) => {
      const response = await api.patch('/auth/me', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      dispatch({ type: 'SET_SUCCESS', value: 'Profile updated successfully!' })
    },
    onError: (err) => {
      dispatch({ type: 'SET_ERROR', value: getErrorMessage(err) })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      first_name: state.firstName,
      last_name: state.lastName,
      bio: state.bio,
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      <div className="mt-8 space-y-8">
        {/* Account info */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              {user?.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  layout="fixed"
                  width={64}
                  height={64}
                  rounded="full"
                />
              )}
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.date_joined ? formatDateTime(user.date_joined) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.is_active ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Edit profile */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Edit Profile</h2>

              {state.error && (
                <Alert variant="error" className="mt-4">
                  {state.error}
                </Alert>
              )}

              {state.success && (
                <Alert variant="success" className="mt-4">
                  {state.success}
                </Alert>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="firstName"
                  label="First name"
                  type="text"
                  aria-label="First name"
                  value={state.firstName}
                  onChange={(e) => dispatch({ type: 'SET_FIRST_NAME', value: e.target.value })}
                />

                <Input
                  id="lastName"
                  label="Last name"
                  type="text"
                  aria-label="Last name"
                  value={state.lastName}
                  onChange={(e) => dispatch({ type: 'SET_LAST_NAME', value: e.target.value })}
                />

                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="label">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    aria-label="Bio"
                    value={state.bio}
                    onChange={(e) => dispatch({ type: 'SET_BIO', value: e.target.value })}
                    className="input mt-1"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
                {updateProfile.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
