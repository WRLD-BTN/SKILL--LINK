import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { jobs, loginLogs, notifications, platformReviews, platformUsers, reports, skills } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { readJoinRequests, writeJoinRequests } from '../lib/joinRequests'
import { readRegisteredUsers, upsertRegisteredUser, writeRegisteredUsers } from '../lib/registeredUsers'
import type { JoinRequest } from '../types'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [registeredUsers, setRegisteredUsers] = useState(platformUsers)

  useEffect(() => {
    setJoinRequests(readJoinRequests())
    setRegisteredUsers(readRegisteredUsers())
  }, [])

  if (user?.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  const allUsers = useMemo(() => registeredUsers, [registeredUsers])

  const activeTradespeople = allUsers.filter(
    (user) => user.role === 'tradesperson' && user.status === 'Active',
  ).length
  const flaggedReviews = platformReviews.filter((review) => review.status === 'Flagged').length
  const openReports = reports.filter((report) => report.status !== 'Resolved').length
  const adminAlerts = notifications.filter((item) => item.audience === 'admin' || item.audience === 'both')
  const pendingJoinRequests = joinRequests.filter((request) => request.status === 'Pending').length

  function updateJoinRequestStatus(id: string, status: JoinRequest['status']) {
    const nextRequests = joinRequests.map((request) =>
      request.id === id ? { ...request, status } : request,
    )

    setJoinRequests(nextRequests)
    writeJoinRequests(nextRequests)

    if (status === 'Approved') {
      const approvedRequest = nextRequests.find((request) => request.id === id)

      if (approvedRequest) {
        upsertRegisteredUser({
          fullName: approvedRequest.fullName,
          phone: approvedRequest.phone,
          email: approvedRequest.email,
          suburb: approvedRequest.suburb,
          role: 'tradesperson',
        })
        setRegisteredUsers(readRegisteredUsers())
      }
    }
  }

  function updateUserStatus(phone: string, status: 'Active' | 'Suspended') {
    const nextUsers = registeredUsers.map((entry) =>
      entry.phone.trim() === phone.trim() ? { ...entry, status } : entry,
    )

    setRegisteredUsers(nextUsers)
    writeRegisteredUsers(nextUsers)
  }

  function removeUser(phone: string) {
    const nextUsers = registeredUsers.filter((entry) => entry.phone.trim() !== phone.trim())
    setRegisteredUsers(nextUsers)
    writeRegisteredUsers(nextUsers)
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Admin control</span>
          <h1>Admin dashboard</h1>
        </div>
      </section>

      <section className="stats-grid admin-stats">
        <article className="stat-card">
          <strong>{allUsers.length}</strong>
          <span>Total users</span>
        </article>
        <article className="stat-card">
          <strong>{activeTradespeople}</strong>
          <span>Active tradespeople</span>
        </article>
        <article className="stat-card">
          <strong>{jobs.length}</strong>
          <span>Jobs on platform</span>
        </article>
        <article className="stat-card">
          <strong>{flaggedReviews}</strong>
          <span>Flagged reviews</span>
        </article>
        <article className="stat-card">
          <strong>{pendingJoinRequests}</strong>
          <span>Pending join requests</span>
        </article>
      </section>

      <section className="admin-links">
        <a className="admin-link-card" href="#requests">
          <strong>Requests</strong>
          <span>{pendingJoinRequests} pending</span>
        </a>
        <a className="admin-link-card" href="#users">
          <strong>User management</strong>
          <span>{allUsers.length} users</span>
        </a>
        <a className="admin-link-card" href="#jobs">
          <strong>Jobs</strong>
          <span>{jobs.length} listed</span>
        </a>
        <a className="admin-link-card" href="#reviews">
          <strong>Reviews and reports</strong>
          <span>{flaggedReviews + openReports} items</span>
        </a>
      </section>

      <section className="admin-grid">
        <div className="panel" id="requests">
          <a className="section-link" href="#requests">
            <h2>Tradesperson join requests</h2>
          </a>
          <div className="list-stack">
            {joinRequests.map((request) => (
              <article className="list-item" key={request.id}>
                <div>
                  <strong>{request.fullName}</strong>
                  <p className="muted">
                    {request.primarySkill} · {request.yearsExperience} yrs · {request.suburb},{' '}
                    {request.city}
                  </p>
                  <p className="muted">
                    {request.email} · {request.phone} · {request.submittedAt}
                  </p>
                </div>
                <div className="action-row">
                  <span className="status">{request.status}</span>
                  <button
                    className="ghost-button"
                    onClick={() => updateJoinRequestStatus(request.id, 'Approved')}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => updateJoinRequestStatus(request.id, 'Rejected')}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel" id="users">
          <a className="section-link" href="#users">
            <h2>User management</h2>
          </a>
          <div className="list-stack">
            {allUsers.map((user) => (
              <article className="list-item" key={user.id}>
                <div>
                  <strong>{user.fullName}</strong>
                  <p className="muted">
                    {user.phone} · {user.suburb} · {user.role}
                  </p>
                  {user.email && <p className="muted">{user.email}</p>}
                </div>
                <div className="action-row">
                  <span className="status">{user.status}</span>
                  <button
                    className="ghost-button"
                    onClick={() => updateUserStatus(user.phone, 'Suspended')}
                    type="button"
                  >
                    Suspend
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => updateUserStatus(user.phone, 'Active')}
                    type="button"
                  >
                    Restore
                  </button>
                  <button className="ghost-button" onClick={() => removeUser(user.phone)} type="button">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel" id="jobs">
          <a className="section-link" href="#jobs">
            <h2>Jobs and disputes</h2>
          </a>
          <div className="list-stack">
            {jobs.map((job) => (
              <article className="list-item" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <p className="muted">
                    {job.suburb} · {job.clientName} · {job.status}
                  </p>
                </div>
                <div className="action-row">
                  <button className="ghost-button" type="button">
                    Edit
                  </button>
                  <button className="ghost-button" type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel" id="reviews">
          <a className="section-link" href="#reviews">
            <h2>Reviews and reports</h2>
          </a>
          <div className="list-stack">
            {platformReviews.map((review) => (
              <article className="list-item" key={review.id}>
                <div>
                  <strong>
                    {review.target} · {review.rating}/5
                  </strong>
                  <p className="muted">{review.comment}</p>
                </div>
                <div className="action-row">
                  <span className="status">{review.status}</span>
                  <button className="ghost-button" type="button">
                    Delete review
                  </button>
                </div>
              </article>
            ))}
            {reports.map((report) => (
              <article className="list-item" key={report.id}>
                <div>
                  <strong>
                    {report.type}: {report.subject}
                  </strong>
                  <p className="muted">{report.reason}</p>
                </div>
                <div className="action-row">
                  <span className="status">{report.status}</span>
                  <button className="ghost-button" type="button">
                    Investigate
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel" id="activity">
          <a className="section-link" href="#activity">
            <h2>Skills and security</h2>
          </a>
          <div className="stack-section">
            <div className="mini-block">
              <strong>Manage skill categories</strong>
              <div className="pill-row">
                {skills.map((skill) => (
                  <span className="pill" key={skill.id}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="mini-block">
              <strong>Recent login logs</strong>
              <div className="list-stack">
                {loginLogs.map((log) => (
                  <article className="list-item tight" key={log.id}>
                    <div>
                      <strong>{log.user}</strong>
                      <p className="muted">
                        {log.ipAddress} · {log.time}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="mini-block">
              <strong>Pending actions</strong>
              <p className="muted">
                {openReports} open reports · {adminAlerts.length} admin alerts · {pendingJoinRequests}{' '}
                join requests
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
