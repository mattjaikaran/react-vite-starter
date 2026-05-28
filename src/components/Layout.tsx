import { useSyncExternalStore } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui'

function subscribe() {
  return () => {}
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function getServerYear() {
  return null as number | null
}

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const currentYear = useSyncExternalStore(subscribe, getCurrentYear, getServerYear)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link to="/" className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-primary-600">MyApp</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {user?.email}
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} MyApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
