// Registered users are persisted locally so approval and dashboard flows survive refreshes in the MVP.
import { platformUsers } from '../data/mockData'
import type { PlatformUser, UserRole } from '../types'

const storageKey = 'skilllink-registered-users'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function matchesUserContact(user: PlatformUser, email: string, phone: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPhone = phone.trim()

  return (
    (normalizedEmail.length > 0 && user.email.trim().toLowerCase() === normalizedEmail) ||
    (normalizedPhone.length > 0 && user.phone.trim() === normalizedPhone)
  )
}

export function readRegisteredUsers() {
  if (!canUseStorage()) {
    return platformUsers
  }

  const saved = window.localStorage.getItem(storageKey)

  if (!saved) {
    window.localStorage.setItem(storageKey, JSON.stringify(platformUsers))
    return platformUsers
  }

  try {
    const parsed = JSON.parse(saved) as PlatformUser[]
    const merged = [...parsed]

    for (const user of platformUsers) {
      if (!merged.some((existing) => existing.phone.trim() === user.phone.trim())) {
        merged.push(user)
      }
    }

    if (merged.length !== parsed.length) {
      window.localStorage.setItem(storageKey, JSON.stringify(merged))
    }

    return merged
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(platformUsers))
    return platformUsers
  }
}

export function writeRegisteredUsers(users: PlatformUser[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(users))
}

export function findRegisteredUserByContact(input: {
  email?: string
  phone?: string
  role?: UserRole
}) {
  return readRegisteredUsers().find((user) => {
    if (input.role && user.role !== input.role) {
      return false
    }

    return matchesUserContact(user, input.email ?? '', input.phone ?? '')
  })
}

export function upsertRegisteredUser(input: {
  fullName: string
  phone: string
  email: string
  suburb: string
  role: UserRole
  status?: PlatformUser['status']
}) {
  if (!canUseStorage()) {
    return
  }

  const users = readRegisteredUsers()
  const email = input.email.trim().toLowerCase()
  const phone = input.phone.trim()
  const existing = users.find((user) => user.phone.trim() === phone)

  const nextUser: PlatformUser = existing
    ? {
        ...existing,
        fullName: input.fullName.trim() || existing.fullName,
        email,
        phone,
        suburb: input.suburb.trim() || existing.suburb,
        role: input.role,
        status: input.status ?? existing.status,
      }
    : {
        id: `signup-${Date.now()}`,
        fullName: input.fullName.trim() || 'SkillLink User',
        email,
        phone,
        suburb: input.suburb.trim() || 'Harare',
        role: input.role,
        status: input.status ?? 'Active',
        registeredAt: new Date().toISOString().slice(0, 10),
      }

  const nextUsers = existing
    ? users.map((user) => (user.phone.trim() === phone ? nextUser : user))
    : [nextUser, ...users]

  writeRegisteredUsers(nextUsers)
}
