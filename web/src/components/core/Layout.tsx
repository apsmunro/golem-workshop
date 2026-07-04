import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useWorkshopStore } from '../../store'

export function Layout() {
  const theme = useWorkshopStore((s) => s.theme)
  const toggleTheme = useWorkshopStore((s) => s.toggleTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen bg-ground text-primary">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] items-baseline justify-between px-6 py-4">
          <Link
            to="/"
            className="font-display text-md !text-primary !no-underline"
          >
            The Golem Workshop
          </Link>
          <nav className="flex items-baseline gap-6">
            <Link to="/bestiary" className="text-sm !text-secondary !no-underline transition-colors duration-[180ms] hover:!text-accent-bright">
              Bestiary
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="eyebrow cursor-pointer rounded-control border border-line px-4 py-1 !text-primary transition-colors duration-[180ms] hover:border-accent"
            >
              {theme === 'workshop' ? 'Daylight' : 'Workshop'}
            </button>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-32 border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <p className="text-sm text-secondary">
            A companion to <em>Statistical Rethinking</em> (2nd ed.) by Richard
            McElreath. Original prose and code throughout; bring your own copy
            of the book.
          </p>
        </div>
      </footer>
    </div>
  )
}
