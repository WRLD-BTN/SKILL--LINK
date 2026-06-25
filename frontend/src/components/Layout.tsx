import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems =
    user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Admin' },
          { to: '/admin/requests', label: 'Requests' },
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
          <img
            src="/logo.png"
            alt="SkillLink"
            className="brand-mark"
            style={{ objectFit: 'contain', padding: '0.15rem' }}
          />
          <div>
            <strong>SkillLink</strong>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav desktop-nav">
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
              <span>{user.role} · {user.suburb}</span>
            </div>
          )}
          <button className="primary-button desktop-logout" onClick={logout} type="button">
            Log out
          </button>

          {/* Hamburger button — mobile only */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            type="button"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button className="mobile-logout" onClick={logout} type="button">
            Log out
          </button>
        </div>
      )}

      <main className="page">{children}</main>
    </div>
  )
}