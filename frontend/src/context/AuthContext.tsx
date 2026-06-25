// AuthContext stores the signed-in user locally while delegating approval and password rules to the backend API.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { changeAdminPasswordRequest, loginRequest, type AuthUserPayload, type LoginResponse } from '../lib/api'
import { normalizeZimbabwePhone } from '../lib/phone'
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
  login: (payload: LoginPayload) => Promise<LoginResponse>
  changeAdminPassword: (payload: ChangeAdminPasswordPayload) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
}

interface LoginPayload {
  mode: 'create' | 'signin'
  name: string
  phone: string
  email: string
  suburb: string
  role: UserRole
  password: string
}

interface ChangeAdminPasswordPayload {
  originalAdminPassword: string
  newPassword: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const storageKey = 'skilllink-auth-user'

function mapAuthUser(user: AuthUserPayload): AuthUser {
  return {
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    suburb: user.suburb,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)

    if (saved) {
      try {
        setUser(JSON.parse(saved) as AuthUser)
      } catch (error) {
        console.error('Failed to parse saved auth user', error)
        window.localStorage.removeItem(storageKey)
      }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async ({ email, mode, name, password, phone, role, suburb }) => {
        const cleanedEmail = email.trim().toLowerCase()
        const normalizedPhone = normalizeZimbabwePhone(phone) ?? phone.trim()

        const result = await loginRequest({
          mode,
          name,
          email: cleanedEmail,
          password,
          phone: normalizedPhone,
          role,
          suburb,
        })

        if (result.ok && result.user) {
          const nextUser = mapAuthUser(result.user)
          setUser(nextUser)
          window.localStorage.setItem(storageKey, JSON.stringify(nextUser))
        }

        return result
      },
      changeAdminPassword: async ({ confirmPassword, newPassword, originalAdminPassword }) => {
        if (!user || user.role !== 'admin') {
          return { ok: false, message: 'Only a signed-in admin can change this password.' }
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
          return { ok: false, message: 'New password and confirmation do not match.' }
        }

        return changeAdminPasswordRequest({
          email: user.email,
          originalAdminPassword,
          newPassword,
        })
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
