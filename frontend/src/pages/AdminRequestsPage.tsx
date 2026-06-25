// AdminRequestsPage fetches the approval queue from the backend so browser storage is no longer the source of truth.
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchAdminRequests } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { JoinRequest } from '../types'

export function AdminRequestsPage() {
  const { user } = useAuth()
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminRequests()
      .then((requests) => {
        setJoinRequests(requests)
        setError('')
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load requests.')
      })
  }, [])

  if (user?.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  const pendingRequests = useMemo(
    () => joinRequests.filter((request) => request.status === 'Pending'),
    [joinRequests],
  )

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Admin queue</span>
          <h1>Tradesperson requests</h1>
          <p className="muted">Each request opens on its own page so approval work stays focused.</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <strong>{joinRequests.length}</strong>
          <span>Total requests</span>
        </article>
        <article className="stat-card">
          <strong>{pendingRequests.length}</strong>
          <span>Pending review</span>
        </article>
        <article className="stat-card">
          <strong>{joinRequests.filter((request) => request.status === 'Approved').length}</strong>
          <span>Approved</span>
        </article>
      </section>

      <section className="panel">
        {error && <p className="auth-error">{error}</p>}
        <div className="list-stack">
          {joinRequests.map((request) => (
            <article className="list-item" key={request.id}>
              <div>
                <strong>{request.fullName}</strong>
                <p className="muted">
                  {request.primarySkill} · {request.suburb}, {request.city}
                </p>
                <p className="muted">{request.submittedAt}</p>
              </div>
              <div className="action-row">
                <span className="status">{request.status}</span>
                <Link className="ghost-button" to={`/admin/requests/${request.id}`}>
                  Open request
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
