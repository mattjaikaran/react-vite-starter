import { Outlet, Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui'

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              r.
            </span>
            <span>
              MyApp<span className="brand-caption">A React Vite starter</span>
            </span>
          </Link>
          <div className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>
            {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="profile-link">
                  {user?.email || 'Profile'}
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>MyApp · Built with care, ready for your ideas.</p>
        <Link to="/">
          Back to home <span aria-hidden="true">↑</span>
        </Link>
      </footer>
    </div>
  )
}
