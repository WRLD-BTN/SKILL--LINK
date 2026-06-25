// Frontend API helpers centralize calls to the backend so auth and admin pages stay focused on UI state.
import type { JoinRequest, PlatformUser, UserRole } from '../types'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

// Validate environment at startup
if (!import.meta.env.VITE_API_URL) {
  console.warn('[SkillLink] VITE_API_URL not configured, using default http://localhost:4000')
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const body = (await response.json().catch(() => null)) as T | null

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message ?? 'Request failed.')
  }

  return body as T
}

export interface AuthUserPayload {
  name: string
  phone: string
  email: string
  role: UserRole
  suburb: string
}

export interface LoginResponse {
  ok: boolean
  message?: string
  requiresApproval?: boolean
  status?: 'Pending' | 'Rejected' | 'Approved'
  user?: AuthUserPayload
}

export async function loginRequest(payload: {
  mode: 'create' | 'signin'
  name: string
  phone: string
  email: string
  suburb: string
  role: UserRole
  password: string
}) {
  return requestJson<LoginResponse>('/api/auth/access', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function submitTradespersonRequest(payload: {
  fullName: string
  email: string
  phone: string
  suburb: string
  city: string
  primarySkill: string
  yearsExperience: number
  password: string
}) {
  return requestJson<{ ok: boolean; message: string; request: JoinRequest }>('/api/auth/tradesperson-request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchTradespersonStatus(input: { email?: string; phone?: string }) {
  const params = new URLSearchParams()

  if (input.email) {
    params.set('email', input.email)
  }

  if (input.phone) {
    params.set('phone', input.phone)
  }

  return requestJson<{ ok: boolean; status: JoinRequest }>('/api/auth/tradesperson-status?' + params.toString())
}

export async function fetchAdminUsers() {
  return requestJson<PlatformUser[]>('/api/admin/users')
}

export async function updateAdminUserStatus(userId: string, status: PlatformUser['status']) {
  return requestJson<{ ok: boolean; user: PlatformUser }>(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function removeAdminUser(userId: string) {
  return requestJson<{ ok: boolean }>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
}

export async function fetchAdminRequests() {
  return requestJson<JoinRequest[]>('/api/admin/requests')
}

export async function fetchAdminRequest(requestId: string) {
  return requestJson<{ ok: boolean; request: JoinRequest }>(`/api/admin/requests/${requestId}`)
}

export async function updateAdminRequestStatus(requestId: string, status: JoinRequest['status']) {
  return requestJson<{ ok: boolean; request: JoinRequest }>(`/api/admin/requests/${requestId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

export async function changeAdminPasswordRequest(payload: {
  email: string
  originalAdminPassword: string
  newPassword: string
}) {
  return requestJson<{ ok: boolean; message: string }>('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
