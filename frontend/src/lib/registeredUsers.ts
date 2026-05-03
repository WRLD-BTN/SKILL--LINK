import { platformUsers } from '../data/mockData'
import type { PlatformUser, UserRole } from '../types'

const storageKey = 'skilllink-registered-users'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
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

export function upsertRegisteredUser(input: {
  fullName: string
  phone: string
  email: string
  suburb: string
  role: UserRole
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
      }
    : {
        id: `signup-${Date.now()}`,
        fullName: input.fullName.trim() || 'SkillLink User',
        email,
        phone,
        suburb: input.suburb.trim() || 'Harare',
        role: input.role,
        status: 'Active',
        registeredAt: new Date().toISOString().slice(0, 10),
      }

  const nextUsers = existing
    ? users.map((user) => (user.phone.trim() === phone ? nextUser : user))
    : [nextUser, ...users]

  writeRegisteredUsers(nextUsers)
}
