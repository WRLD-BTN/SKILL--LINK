// Admin dashboard now reads users and join-request counts from the backend so approval state is not browser-only.
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  changeAdminPasswordRequest,
  fetchAdminRequests,
  fetchAdminUsers,
  removeAdminUser,
  updateAdminUserStatus,
} from '../lib/api'
import { jobs, loginLogs, notifications, platformReviews, reports, skills } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import type { JoinRequest, PlatformUser } from '../types'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [registeredUsers, setRegisteredUsers] = useState<PlatformUser[]>([])
  const [originalAdminPassword, setOriginalAdminPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    Promise.all([fetchAdminRequests(), fetchAdminUsers()])
      .then(([requests, users]) => {
        setJoinRequests(requests)
        setRegisteredUsers(users)
        setDataError('')
      })
      .catch((adminError) => {
        setDataError(adminError instanceof Error ? adminError.message : 'Unable to load admin data.')
      })
  }, [])

  if (user?.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  const adminUser = user

  const activeUsers = registeredUsers.filter((registeredUser) => registeredUser.status === 'Active').length
  const activeClients = registeredUsers.filter(
    (registeredUser) => registeredUser.role === 'client' && registeredUser.status === 'Active',
  ).length
  const activeTradespeople = registeredUsers.filter(
    (registeredUser) => registeredUser.role === 'tradesperson' && registeredUser.status === 'Active',
  ).length
  const flaggedReviews = platformReviews.filter((review) => review.status === 'Flagged').length
  const openReports = reports.filter((report) => report.status !== 'Resolved').length
  const adminAlerts = notifications.filter((item) => item.audience === 'admin' || item.audience === 'both')
  const pendingJoinRequests = useMemo(
    () => joinRequests.filter((request) => request.status === 'Pending'),
    [joinRequests],
  )

  async function handleUserStatus(userId: string, status: PlatformUser['status']) {
    try {
      const result = await updateAdminUserStatus(userId, status)
      setRegisteredUsers((current) => current.map((entry) => (entry.id === userId ? result.user : entry)))
    } catch (statusError) {
      setDataError(statusError instanceof Error ? statusError.message : 'Unable to update user status.')
    }
  }

  async function handleUserRemoval(userId: string) {
    try {
      await removeAdminUser(userId)
      setRegisteredUsers((current) => current.filter((entry) => entry.id !== userId))
    } catch (removeError) {
      setDataError(removeError instanceof Error ? removeError.message : 'Unable to remove user.')
    }
  }

  async function handlePasswordChange() {
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    try {
      const result = await changeAdminPasswordRequest({
        email: adminUser.email,
        originalAdminPassword,
        newPassword,
      })

      setOriginalAdminPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage(result.message)
    } catch (changeError) {
      setPasswordError(changeError instanceof Error ? changeError.message : 'Unable to change password.')
    }
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Admin control</span>
          <h1>Admin dashboard</h1>
        </div>
      </section>

      {dataError && <p className="auth-error">{dataError}</p>}

      <section className="stats-grid admin-stats">
        <article className="stat-card">
          <strong>{activeUsers}</strong>
          <span>Active users</span>
        </article>
        <article className="stat-card">
          <strong>{activeClients}</strong>
          <span>Active clients</span>
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
          <strong>{pendingJoinRequests.length}</strong>
          <span>Pending join requests</span>
        </article>
      </section>

      <section className="admin-links">
        <Link className="admin-link-card" to="/admin/requests">
          <strong>Requests</strong>
          <span>{pendingJoinRequests.length} pending</span>
        </Link>
        <a className="admin-link-card" href="#users">
          <strong>User management</strong>
          <span>{registeredUsers.length} users</span>
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
          <Link className="section-link" to="/admin/requests">
            <h2>Tradesperson join requests</h2>
          </Link>
          <div className="list-stack">
            {pendingJoinRequests.slice(0, 5).map((request) => (
              <article className="list-item" key={request.id}>
                <div>
                  <strong>{request.fullName}</strong>
                  <p className="muted">
                    {request.primarySkill} · {request.suburb}, {request.city}
                  </p>
                </div>
                <div className="action-row">
                  <span className="status">{request.status}</span>
                  <Link className="ghost-button" to={`/admin/requests/${request.id}`}>
                    Review
                  </Link>
                </div>
              </article>
            ))}
            {pendingJoinRequests.length === 0 && <p className="muted">No pending join requests right now.</p>}
          </div>
        </div>

        <div className="panel" id="users">
          <a className="section-link" href="#users">
            <h2>User management</h2>
          </a>
          <div className="list-stack">
            {registeredUsers.map((registeredUser) => (
              <article className="list-item" key={registeredUser.id}>
                <div>
                  <strong>{registeredUser.fullName}</strong>
                  <p className="muted">
                    {registeredUser.phone} · {registeredUser.suburb} · {registeredUser.role}
                  </p>
                  {registeredUser.email && <p className="muted">{registeredUser.email}</p>}
                </div>
                <div className="action-row">
                  <span className="status">{registeredUser.status}</span>
                  <button
                    className="ghost-button"
                    onClick={() => handleUserStatus(registeredUser.id, 'Suspended')}
                    type="button"
                  >
                    Suspend
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => handleUserStatus(registeredUser.id, 'Active')}
                    type="button"
                  >
                    Restore
                  </button>
                  <button className="ghost-button" onClick={() => handleUserRemoval(registeredUser.id)} type="button">
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
              <strong>Admin password settings</strong>
              <p className="muted">
                Each admin can keep a personal password, but the original SkillLink admin password is still required to set it.
              </p>
              <div className="auth-form inline-form">
                <label>
                  Original SkillLink password
                  <input
                    className="text-input"
                    onChange={(event) => setOriginalAdminPassword(event.target.value)}
                    type="password"
                    value={originalAdminPassword}
                  />
                </label>
                <label>
                  New personal password
                  <input
                    className="text-input"
                    onChange={(event) => setNewPassword(event.target.value)}
                    type="password"
                    value={newPassword}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    className="text-input"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                    value={confirmPassword}
                  />
                </label>
                {passwordError && <p className="auth-error">{passwordError}</p>}
                {passwordMessage && <p className="auth-success">{passwordMessage}</p>}
                <button className="primary-button" onClick={handlePasswordChange} type="button">
                  Save personal password
                </button>
              </div>
            </div>
            <div className="mini-block">
              <strong>Pending actions</strong>
              <p className="muted">
                {openReports} open reports · {adminAlerts.length} admin alerts · {pendingJoinRequests.length}{' '}
                join requests
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
