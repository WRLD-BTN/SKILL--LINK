import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notifications, skills } from '../data/mockData'
import { addClientJob, readApplications, readJobs } from '../lib/marketplaceStore'
import type { Application, Job } from '../types'

export function DashboardPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [title, setTitle] = useState('')
  const [suburb, setSuburb] = useState(user?.suburb ?? '')
  const [description, setDescription] = useState('')
  const [skillName, setSkillName] = useState(skills[0]?.name ?? 'Plumber')
  const [budgetMax, setBudgetMax] = useState('120')
  const [message, setMessage] = useState('')
  const role = user?.role ?? 'client'

  useEffect(() => {
    setJobs(readJobs())
    setApplications(readApplications())
  }, [])

  useEffect(() => {
    setSuburb(user?.suburb ?? '')
  }, [user?.suburb])

  if (role === 'admin') {
    return <Navigate replace to="/admin" />
  }

  const email = user?.email.trim().toLowerCase() ?? ''
  const personalJobs = useMemo(
    () => jobs.filter((job) => job.clientEmail.trim().toLowerCase() === email),
    [email, jobs],
  )
  const personalApplications = useMemo(
    () => applications.filter((application) => application.tradespersonEmail.trim().toLowerCase() === email),
    [applications, email],
  )
  const applicantActivity = useMemo(
    () => applications.filter((application) => application.clientEmail.trim().toLowerCase() === email),
    [applications, email],
  )
  const nearbyOpenJobs = useMemo(
    () =>
      jobs
        .filter(
          (job) =>
            job.status === 'Open' &&
            job.clientEmail.trim().toLowerCase() !== email &&
            (job.suburb.toLowerCase().includes(user?.suburb.toLowerCase() ?? '') ||
              job.city.toLowerCase().includes(user?.suburb.toLowerCase() ?? '')),
        )
        .slice(0, 4),
    [email, jobs, user?.suburb],
  )
  const baseAlerts = useMemo(
    () => notifications.filter((item) => item.audience === role || item.audience === 'both'),
    [role],
  )
  const alerts = useMemo(() => {
    if (role === 'client') {
      return [
        {
          id: 9101,
          title: `${personalJobs.length} job requests posted`,
          detail:
            personalJobs.length > 0
              ? `${applicantActivity.length} applications have reached your requests.`
              : 'Post your first request and it will appear here right away.',
          audience: 'client' as const,
        },
        {
          id: 9102,
          title: `${user?.suburb ?? 'Your area'} activity`,
          detail:
            applicantActivity.length > 0
              ? `${applicantActivity[0].tradespersonName} recently responded to ${applicantActivity[0].jobTitle}.`
              : 'New tradesperson interest will appear here.',
          audience: 'client' as const,
        },
        ...baseAlerts,
      ]
    }

    return [
      {
        id: 9201,
        title: `${personalApplications.length} applications from your account`,
        detail:
          personalApplications.length > 0
            ? `Latest: ${personalApplications[0].jobTitle} in ${personalApplications[0].suburb}.`
            : 'Apply to open work and track the response here.',
        audience: 'tradesperson' as const,
      },
      {
        id: 9202,
        title: `${nearbyOpenJobs.length} nearby open jobs`,
        detail:
          nearbyOpenJobs.length > 0
            ? `Closest match: ${nearbyOpenJobs[0].title}.`
            : 'More jobs will appear here as clients post them.',
        audience: 'tradesperson' as const,
      },
      ...baseAlerts,
    ]
  }, [applicantActivity, baseAlerts, nearbyOpenJobs, personalApplications, personalJobs.length, role, user?.suburb])

  const totalApplicants = applicantActivity.length
  const acceptedApplications = personalApplications.filter((item) => item.status === 'Accepted').length

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Personal dashboard</span>
          <h1>{role === 'client' ? `Welcome back, ${user?.name}` : `${user?.name}'s workboard`}</h1>
          <p className="muted">
            {role === 'client'
              ? `You are posting and tracking requests around ${user?.suburb}.`
              : `You are tracking applications and nearby opportunities around ${user?.suburb}.`}
          </p>
        </div>
      </section>

      <section className="stats-grid dashboard-stats">
        <article className="stat-card">
          <strong>{role === 'client' ? personalJobs.length : personalApplications.length}</strong>
          <span>{role === 'client' ? 'Your requests' : 'Your applications'}</span>
        </article>
        <article className="stat-card">
          <strong>{role === 'client' ? totalApplicants : acceptedApplications}</strong>
          <span>{role === 'client' ? 'Responses received' : 'Accepted jobs'}</span>
        </article>
        <article className="stat-card">
          <strong>{role === 'client' ? applicantActivity.length : nearbyOpenJobs.length}</strong>
          <span>{role === 'client' ? 'Applicant activity' : 'Nearby open jobs'}</span>
        </article>
        <article className="stat-card">
          <strong>{alerts.length}</strong>
          <span>Personal alerts</span>
        </article>
      </section>

      {role === 'client' && (
        <section className="panel">
          <div className="section-header compact-header">
            <div>
              <Link className="section-link" to="/jobs">
                <h2>Enter requests</h2>
              </Link>
            </div>
          </div>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              setMessage('')

              const selectedSkill = skills.find((skill) => skill.name === skillName)
              if (!user || !selectedSkill || !title.trim() || !suburb.trim()) {
                setMessage('Add the job title, suburb, and skill before posting.')
                return
              }

              const nextJob = addClientJob({
                title: title.trim(),
                description: description.trim() || 'Client posted a new request from the dashboard.',
                skill: selectedSkill,
                city: 'Harare',
                suburb: suburb.trim(),
                clientName: user.name,
                clientEmail: user.email,
                budgetMin: 0,
                budgetMax: Number(budgetMax) || 0,
                urgency: 'Flexible',
              })

              setJobs(readJobs())
              setApplications(readApplications())
              setTitle('')
              setDescription('')
              setBudgetMax('120')
              setMessage(`Your request "${nextJob.title}" is now live.`)
            }}
          >
            <div className="form-grid compact-grid">
              <label>
                Job title
                <input
                  className="text-input"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Need an electrician for kitchen lights"
                  type="text"
                  value={title}
                />
              </label>
              <label>
                Skill needed
                <select className="text-input" onChange={(event) => setSkillName(event.target.value)} value={skillName}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Suburb
                <input
                  className="text-input"
                  onChange={(event) => setSuburb(event.target.value)}
                  placeholder="Borrowdale"
                  type="text"
                  value={suburb}
                />
              </label>
              <label>
                Budget ceiling
                <input
                  className="text-input"
                  min="0"
                  onChange={(event) => setBudgetMax(event.target.value)}
                  type="number"
                  value={budgetMax}
                />
              </label>
            </div>
            <label>
              Notes
              <textarea
                className="text-input textarea-input"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short note helps the right person respond faster."
                value={description}
              />
            </label>
            {message && <p className="auth-success">{message}</p>}
            <button className="primary-button" type="submit">
              Submit request
            </button>
          </form>
        </section>
      )}

      <section className="split-layout dashboard-layout">
        <div className="panel">
          <Link className="section-link" to="/jobs">
            <h2>{role === 'client' ? 'Your posted requests' : 'Your applications'}</h2>
          </Link>
          <div className="list-stack">
            {role === 'client'
              ? personalJobs.slice(0, 6).map((job) => (
                  <article className="list-item" key={job.id}>
                    <div>
                      <strong>{job.title}</strong>
                      <p className="muted">
                        {job.suburb} · {job.skill.name} · {job.status}
                      </p>
                    </div>
                    <span>{job.applicants} responses</span>
                  </article>
                ))
              : personalApplications.slice(0, 6).map((application) => (
                  <article className="list-item" key={application.id}>
                    <div>
                      <strong>{application.jobTitle}</strong>
                      <p className="muted">
                        {application.clientName} · {application.suburb}
                      </p>
                    </div>
                    <span>{application.status}</span>
                  </article>
                ))}
            {role === 'client' && personalJobs.length === 0 && (
              <p className="muted">You have not posted any requests yet.</p>
            )}
            {role === 'tradesperson' && personalApplications.length === 0 && (
              <p className="muted">You have not applied to any jobs yet.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <Link className="section-link" to="/jobs">
            <h2>{role === 'client' ? 'People responding to you' : 'Jobs near you'}</h2>
          </Link>
          <div className="list-stack">
            {role === 'client'
              ? applicantActivity.slice(0, 6).map((application) => (
                  <article className="list-item" key={application.id}>
                    <div>
                      <strong>{application.tradespersonName}</strong>
                      <p className="muted">
                        Applied to {application.jobTitle} · ${application.proposedRate}
                      </p>
                    </div>
                    <span>{application.status}</span>
                  </article>
                ))
              : nearbyOpenJobs.map((job) => (
                  <article className="list-item" key={job.id}>
                    <div>
                      <strong>{job.title}</strong>
                      <p className="muted">
                        {job.suburb} · ${job.budgetMin} - ${job.budgetMax}
                      </p>
                    </div>
                    <span>{job.skill.name}</span>
                  </article>
                ))}
            {role === 'client' && applicantActivity.length === 0 && (
              <p className="muted">Tradesperson responses will appear here as they come in.</p>
            )}
            {role === 'tradesperson' && nearbyOpenJobs.length === 0 && (
              <p className="muted">No nearby jobs are open yet for your area.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <Link className="section-link" to="/jobs">
          <h2>Your alerts</h2>
        </Link>
        <div className="list-stack">
          {alerts.map((item) => (
            <Link className="list-link" key={item.id} to="/jobs">
              <article className="list-item">
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">{item.detail}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
