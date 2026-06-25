// Join requests are stored locally so admin review can behave like a lightweight workflow without a backend dependency.
import { initialJoinRequests } from '../data/mockData'
import type { JoinRequest } from '../types'

const storageKey = 'skilllink-join-requests'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function matchesRequestContact(request: JoinRequest, email: string, phone: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPhone = phone.trim()

  return (
    (normalizedEmail.length > 0 && request.email.trim().toLowerCase() === normalizedEmail) ||
    (normalizedPhone.length > 0 && request.phone.trim() === normalizedPhone)
  )
}

export function readJoinRequests() {
  if (!canUseStorage()) {
    return initialJoinRequests
  }

  const saved = window.localStorage.getItem(storageKey)

  if (!saved) {
    window.localStorage.setItem(storageKey, JSON.stringify(initialJoinRequests))
    return initialJoinRequests
  }

  try {
    const parsed = JSON.parse(saved) as JoinRequest[]
    const merged = [...parsed]

    for (const request of initialJoinRequests) {
      if (!merged.some((existing) => existing.id === request.id)) {
        merged.push(request)
      }
    }

    if (merged.length !== parsed.length) {
      window.localStorage.setItem(storageKey, JSON.stringify(merged))
    }

    return merged
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(initialJoinRequests))
    return initialJoinRequests
  }
}

export function writeJoinRequests(requests: JoinRequest[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(requests))
}

export function findJoinRequestByContact(input: { email?: string; phone?: string }) {
  return readJoinRequests().find((request) => matchesRequestContact(request, input.email ?? '', input.phone ?? ''))
}

export function readJoinRequest(id: string) {
  return readJoinRequests().find((request) => request.id === id)
}

export function updateJoinRequestStatus(id: string, status: JoinRequest['status']) {
  const nextRequests = readJoinRequests().map((request) =>
    request.id === id ? { ...request, status } : request,
  )

  writeJoinRequests(nextRequests)
  return nextRequests.find((request) => request.id === id)
}

export function addJoinRequest(
  request: Omit<JoinRequest, 'id' | 'status' | 'submittedAt'>,
) {
  const requests = readJoinRequests()
  const submittedAt = new Date().toLocaleString('en-ZW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const existingRequest = requests.find((entry) => matchesRequestContact(entry, request.email, request.phone))
  const nextRequest: JoinRequest = existingRequest
    ? {
        ...existingRequest,
        ...request,
        status: 'Pending',
        submittedAt,
      }
    : {
        ...request,
        id: `jr-${Date.now()}`,
        status: 'Pending',
        submittedAt,
      }

  const nextRequests = existingRequest
    ? [nextRequest, ...requests.filter((entry) => entry.id !== existingRequest.id)]
    : [nextRequest, ...requests]
  writeJoinRequests(nextRequests)
  return nextRequest
}
