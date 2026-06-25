import type { StoredAdminCredential } from '../types'

// Admin passwords are stored locally for this MVP so each approved admin can keep a personal password.
const storageKey = 'skilllink-admin-credentials'
const bootstrapAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? 'skill-l!nk@2026'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getBootstrapAdminPassword() {
  return bootstrapAdminPassword
}

export function readAdminCredentials() {
  if (!canUseStorage()) {
    return [] as StoredAdminCredential[]
  }

  const saved = window.localStorage.getItem(storageKey)

  if (!saved) {
    return [] as StoredAdminCredential[]
  }

  try {
    return JSON.parse(saved) as StoredAdminCredential[]
  } catch {
    window.localStorage.removeItem(storageKey)
    return [] as StoredAdminCredential[]
  }
}

function writeAdminCredentials(credentials: StoredAdminCredential[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(credentials))
}

export function readAdminCredential(email: string) {
  const cleanedEmail = email.trim().toLowerCase()
  return readAdminCredentials().find((credential) => credential.email === cleanedEmail)
}

export function verifyAdminPassword(email: string, password: string) {
  const personalCredential = readAdminCredential(email)

  if (personalCredential) {
    return personalCredential.password === password.trim()
  }

  return password.trim() === bootstrapAdminPassword
}

export function changeStoredAdminPassword(input: {
  email: string
  originalAdminPassword: string
  newPassword: string
}) {
  const cleanedEmail = input.email.trim().toLowerCase()
  const originalPassword = input.originalAdminPassword.trim()
  const nextPassword = input.newPassword.trim()

  if (!cleanedEmail) {
    return { ok: false as const, message: 'Admin email is missing.' }
  }

  if (originalPassword !== bootstrapAdminPassword) {
    return { ok: false as const, message: 'Enter the original SkillLink admin password to continue.' }
  }

  if (nextPassword.length < 6) {
    return { ok: false as const, message: 'New password must be at least 6 characters.' }
  }

  const credentials = readAdminCredentials()
  const nextCredential: StoredAdminCredential = {
    email: cleanedEmail,
    password: nextPassword,
    updatedAt: new Date().toISOString(),
  }

  const updatedCredentials = credentials.some((credential) => credential.email === cleanedEmail)
    ? credentials.map((credential) => (credential.email === cleanedEmail ? nextCredential : credential))
    : [nextCredential, ...credentials]

  writeAdminCredentials(updatedCredentials)
  return { ok: true as const, message: 'Your personal admin password has been updated.' }
}
