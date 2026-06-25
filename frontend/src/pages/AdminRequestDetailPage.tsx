// AdminRequestDetailPage reads and updates the selected request through backend routes.
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchAdminRequest, updateAdminRequestStatus } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { JoinRequest } from '../types'

export function AdminRequestDetailPage() {
  const { user } = useAuth()
  const { requestId } = useParams()
  const [request, setRequest] = useState<JoinRequest | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requestId) {
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    fetchAdminRequest(requestId)
      .then((result) => {
        if (!signal.aborted) {
          setRequest(result.request)
          setError('')
        }
      })
      .catch((requestError) => {
        if (!signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load request.')
        }
      })

    return () => {
      controller.abort()
    }
  }, [requestId])

  if (user?.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  if (!requestId || !request) {
    return (
      <div className="page-stack">
        <section className="panel">
          <h1>Request not found</h1>
          <p className="muted">{error || 'This request may have been removed or is no longer available.'}</p>
          <Link className="primary-button" to="/admin/requests">
            Back to requests
          </Link>
        </section>
      </div>
    )
  }

  const currentRequest = request

  async function handleStatusChange(status: JoinRequest['status']) {
    try {
      const result = await updateAdminRequestStatus(currentRequest.id, status)
      setRequest(result.request)
      setMessage(status === 'Approved' ? 'Tradesperson approved and activated.' : 'Request marked as rejected.')
      setError('')
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'The request could not be updated.')
    }
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Request review</span>
          <h1>{currentRequest.fullName}</h1>
          <p className="muted">
            {currentRequest.primarySkill} · {currentRequest.suburb}, {currentRequest.city}
          </p>
        </div>
        <div className="action-row">
          <span className="status">{currentRequest.status}</span>
          <Link className="ghost-button" to="/admin/requests">
            Back to requests
          </Link>
        </div>
      </section>

      <section className="split-layout">
        <article className="panel detail-panel">
          <h2>Applicant details</h2>
          <div className="detail-grid">
            <div className="detail-block">
              <span className="eyebrow">Contact</span>
              <strong>{currentRequest.email || 'No email provided'}</strong>
              <p className="muted">{currentRequest.phone}</p>
            </div>
            <div className="detail-block">
              <span className="eyebrow">Experience</span>
              <strong>{currentRequest.yearsExperience} years</strong>
              <p className="muted">{currentRequest.primarySkill}</p>
            </div>
            <div className="detail-block">
              <span className="eyebrow">Location</span>
              <strong>{currentRequest.suburb}</strong>
              <p className="muted">{currentRequest.city}</p>
            </div>
            <div className="detail-block">
              <span className="eyebrow">Submitted</span>
              <strong>{currentRequest.submittedAt}</strong>
              <p className="muted">Request id: {currentRequest.id}</p>
            </div>
          </div>
        </article>

        <article className="panel detail-panel">
          <h2>Admin actions</h2>
          <p className="muted">Approve to activate the tradesperson account, or reject to keep them out of login access.</p>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}
          <div className="action-row action-row-start">
            <button className="primary-button" onClick={() => handleStatusChange('Approved')} type="button">
              Approve request
            </button>
            <button className="secondary-button" onClick={() => handleStatusChange('Rejected')} type="button">
              Reject request
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}
