// TradespersonStatusPage gives applicants a dedicated place to check whether admin has approved their request.
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchTradespersonStatus } from '../lib/api'

interface RequestStatusState {
  status: 'Pending' | 'Rejected' | 'Approved'
  fullName?: string
  suburb?: string
  city?: string
  primarySkill?: string
  submittedAt?: string
}

export function TradespersonStatusPage() {
  const [searchParams] = useSearchParams()
  const [requestStatus, setRequestStatus] = useState<RequestStatusState | null>(null)
  const [message, setMessage] = useState('Checking request status...')
  const [error, setError] = useState('')

  useEffect(() => {
    const email = searchParams.get('email') ?? ''
    const phone = searchParams.get('phone') ?? ''

    if (!email && !phone) {
      setError('Open this page with the email or phone used on the request.')
      setMessage('')
      return
    }

    fetchTradespersonStatus({ email, phone })
      .then((result) => {
        setRequestStatus(result.status)
        setError('')
        setMessage(
          result.status.status === 'Approved'
            ? 'Your account has been approved. You can now sign in as a tradesperson.'
            : result.status.status === 'Rejected'
              ? 'Your request was rejected. Update your details and submit a new request.'
              : 'Your request is waiting for admin review.',
        )
      })
      .catch((statusError) => {
        setRequestStatus(null)
        setError(statusError instanceof Error ? statusError.message : 'Unable to load request status.')
        setMessage('')
      })
  }, [searchParams])

  return (
    <div className="page-stack">
      <section className="panel">
        <span className="eyebrow">Tradesperson onboarding</span>
        <h1>Approval status</h1>
        {message && <p className="muted">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
        {requestStatus && (
          <div className="detail-grid">
            <div className="detail-block">
              <span className="eyebrow">Status</span>
              <strong>{requestStatus.status}</strong>
              {requestStatus.submittedAt && <p className="muted">{requestStatus.submittedAt}</p>}
            </div>
            <div className="detail-block">
              <span className="eyebrow">Trade</span>
              <strong>{requestStatus.primarySkill ?? 'Awaiting details'}</strong>
              <p className="muted">
                {[requestStatus.suburb, requestStatus.city].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        )}
        <div className="action-row action-row-start">
          <Link className="primary-button" to="/auth">
            Back to sign in
          </Link>
        </div>
      </section>
    </div>
  )
}
