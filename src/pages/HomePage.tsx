import { Link } from 'react-router-dom'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useAuth } from '@/lib/auth'

const features = [
  {
    title: 'React 19',
    copy: 'Modern components, typed from the first render. Make the interface your own.',
  },
  {
    title: 'Vite',
    copy: 'A fast feedback loop for local development and a production build when you are ready.',
  },
  {
    title: 'TailwindCSS',
    copy: 'Shared primitives and an editable palette, without a new styling system to learn.',
  },
  {
    title: 'TanStack Query',
    copy: 'Server-state caching and an Axios API client ready for your backend.',
  },
  {
    title: 'TypeScript',
    copy: 'Clear contracts across your routes, components, and authentication flows.',
  },
  {
    title: 'React Router',
    copy: 'Public pages, protected routes, and a profile flow already connected.',
  },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-shell">
      <section className="hero-grid" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">A small beginning. Room for something great.</p>
          <h1 id="home-title">
            Welcome to <span>React Vite Starter</span>
          </h1>
          <p className="hero-copy">
            Less setup. More making. A thoughtful starting point for your next React application,
            with the everyday essentials already in place.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Get started <span aria-hidden="true">↗</span>
                </Link>
                <Link to="/login" className="btn-outline">
                  Sign in
                </Link>
              </>
            )}
          </div>
          <p className="hero-note">React 19 · TypeScript · Vite · Made to be edited</p>
        </div>
        <Card className="starter-card" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Your starting point</p>
              <Badge variant="success">Ready to build</Badge>
            </div>
            <CardTitle className="mt-5 text-2xl">The essentials, connected.</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="starter-steps">
              <li>
                <span className="step-number">01</span>
                <div>
                  <strong>Find your direction</strong>
                  <p>Edit this page and the shared theme to tell your story.</p>
                </div>
              </li>
              <li>
                <span className="step-number">02</span>
                <div>
                  <strong>Connect your backend</strong>
                  <p>Use the API client and existing account flows.</p>
                </div>
              </li>
              <li>
                <span className="step-number">03</span>
                <div>
                  <strong>Make it yours</strong>
                  <p>Build on reusable cards, inputs, buttons, and routes.</p>
                </div>
              </li>
            </ol>
            <a className="text-link" href="#features">
              Explore the toolkit <span aria-hidden="true">↓</span>
            </a>
          </CardContent>
        </Card>
      </section>

      <section id="features" className="features-section" aria-labelledby="features-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A practical toolkit</p>
            <h2 id="features-title">Features</h2>
          </div>
          <p>
            Good foundations stay out of your way.
            <br />
            Keep what you need. Shape what comes next.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ title, copy }, index) => (
            <Card key={title} className="feature-card">
              <p className="feature-index" aria-hidden="true">
                0{index + 1}
              </p>
              <CardTitle>{title}</CardTitle>
              <CardContent className="mt-3">
                <p>{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <aside className="closing-note">
        <span className="eyebrow">Your next chapter</span>
        <p>Start with a page. Build something useful.</p>
        <Link className="text-link" to={isAuthenticated ? '/dashboard' : '/register'}>
          {isAuthenticated ? 'Open your workspace' : 'Create your account'}{' '}
          <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </div>
  )
}
