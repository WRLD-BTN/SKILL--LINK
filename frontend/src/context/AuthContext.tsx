import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { normalizeZimbabwePhone } from '../lib/phone'
import { upsertRegisteredUser } from '../lib/registeredUsers'
import type { UserRole } from '../types'

interface AuthUser {
  name: string
  phone: string
  email: string
  role: UserRole
  suburb: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (payload: LoginPayload) => { ok: boolean; message?: string }
  logout: () => void
}

interface LoginPayload {
  name: string
  phone: string
  email: string
  suburb: string
  role: UserRole
  password: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const storageKey = 'skilllink-auth-user'
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)

    if (saved) {
      setUser(JSON.parse(saved) as AuthUser)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: ({ email, name, password, phone, role, suburb }) => {
        const cleanedEmail = email.trim().toLowerCase()
        const normalizedPhone = normalizeZimbabwePhone(phone)

        if (!cleanedEmail) {
          return { ok: false, message: 'Email is required to sign in or create an account.' }
        }

        if (!emailPattern.test(cleanedEmail)) {
          return { ok: false, message: 'Enter a valid email address.' }
        }

        if (role !== 'admin' && !normalizedPhone) {
          return { ok: false, message: 'Enter a valid Zimbabwean phone number.' }
        }

        if (role === 'admin' && password !== adminPassword) {
          return { ok: false, message: 'Admin password is incorrect.' }
        }

        if (password.trim().length < 4) {
          return { ok: false, message: 'Enter a password with at least 4 characters.' }
        }

        const nextUser: AuthUser = {
          name: name.trim() || (role === 'admin' ? 'Admin User' : 'SkillLink User'),
          phone: normalizedPhone ?? phone.trim(),
          email: cleanedEmail,
          role,
          suburb: suburb.trim() || 'Harare',
        }

        setUser(nextUser)
        window.localStorage.setItem(storageKey, JSON.stringify(nextUser))
        upsertRegisteredUser({
          fullName: nextUser.name,
          phone: nextUser.phone,
          email: nextUser.email,
          suburb: nextUser.suburb,
          role: nextUser.role,
        })

        return { ok: true }
      },
      logout: () => {
        setUser(null)
        window.localStorage.removeItem(storageKey)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
