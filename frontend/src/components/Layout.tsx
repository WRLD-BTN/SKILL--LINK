import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navItems =
    user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Admin' },
          { to: '/overview', label: 'Overview' },
          { to: '/tradespeople', label: 'Tradespeople' },
          { to: '/jobs', label: 'Jobs' },
        ]
      : [
          { to: '/overview', label: 'Overview' },
          { to: '/tradespeople', label: 'Tradespeople' },
          { to: '/jobs', label: 'Jobs' },
          { to: '/dashboard', label: 'Dashboard' },
        ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
          <span className="brand-mark">SL</span>
          <div>
            <strong>SkillLink</strong>
          </div>
        </Link>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="auth-actions">
          {user && (
            <div className="user-chip">
              <strong>{user.name}</strong>
              <span>
                {user.role} · {user.suburb}
              </span>
            </div>
          )}
          <button className="primary-button" onClick={logout} type="button">
            Log out
          </button>
        </div>
      </header>

      <main className="page">{children}</main>
    </div>
  )
}
