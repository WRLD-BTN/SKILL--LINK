import { initialJoinRequests } from '../data/mockData'
import type { JoinRequest } from '../types'

const storageKey = 'skilllink-join-requests'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
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

export function addJoinRequest(
  request: Omit<JoinRequest, 'id' | 'status' | 'submittedAt'>,
) {
  const nextRequest: JoinRequest = {
    ...request,
    id: `jr-${Date.now()}`,
    status: 'Pending',
    submittedAt: new Date().toLocaleString('en-ZW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }

  const requests = [nextRequest, ...readJoinRequests()]
  writeJoinRequests(requests)
  return nextRequest
}
