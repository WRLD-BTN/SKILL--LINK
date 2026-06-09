import { useEffect, useMemo, useState } from 'react'
import { LocationMap } from '../components/LocationMap'
import { useAuth } from '../context/AuthContext'
import { skills, tradespeople } from '../data/mockData'
import { addClientJob, applyToJob, readJobs } from '../lib/marketplaceStore'
import type { Job } from '../types'

function buildWhatsAppLink(phone: string, jobTitle: string, userName: string) {
  const clean = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '263' + clean.slice(1) : clean.startsWith('263') ? clean : '263' + clean
  const text = encodeURIComponent(
    `Hi! I found your profile on SkillLink. I need help with: "${jobTitle}". My name is ${userName}. Are you available?`,
  )
  return `https://wa.me/${normalized}?text=${text}`
}

export function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [skillFilter, setSkillFilter] = useState('')
  const [suburbFilter, setSuburbFilter] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('Harare')
  const [suburb, setSuburb] = useState(user?.suburb ?? '')
  const [skillName, setSkillName] = useState(skills[0]?.name ?? 'Plumber')
  const [budgetMin, setBudgetMin] = useState('40')
  const [budgetMax, setBudgetMax] = useState('90')
  const [urgency, setUrgency] = useState<Job['urgency']>('Flexible')
  const [message, setMessage] = useState('')
  const [applyMessage, setApplyMessage] = useState('')

  useEffect(() => { setJobs(readJobs()) }, [])
  useEffect(() => { setSuburb(user?.suburb ?? '') }, [user?.suburb])

  const filtered = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesSkill = skillFilter.length === 0 || job.skill.name.toLowerCase().includes(skillFilter.toLowerCase())
        const matchesSuburb = suburbFilter.length === 0 || job.suburb.toLowerCase().includes(suburbFilter.toLowerCase())
        return matchesSkill && matchesSuburb
      }),
    [jobs, skillFilter, suburbFilter],
  )

  const mapQuery =
    suburbFilter.trim().length > 0
      ? `${suburbFilter.trim()}, Zimbabwe`
      : filtered[0]
        ? `${filtered[0].suburb}, ${filtered[0].city}, Zimbabwe`
        : 'Harare, Zimbabwe'

  // Find a tradesperson matching a job's skill for WhatsApp — used on job cards
  function matchedTradesperson(job: Job) {
    return tradespeople.find((tp) =>
      tp.skills.some((s) => s.name.toLowerCase() === job.skill.name.toLowerCase()),
    )
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">{user?.role === 'client' ? 'For clients' : 'For tradespeople'}</span>
          <h1>{user?.role === 'client' ? 'Post and manage job requests' : 'Browse jobs'}</h1>
        </div>
        <div className="filter-row">
          <input className="text-input" placeholder="Search skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
          <input className="text-input" placeholder="Search suburb" value={suburbFilter} onChange={(e) => setSuburbFilter(e.target.value)} />
        </div>
      </section>

      {user?.role === 'client' && (
        <section className="panel">
          <h2>Quick job request</h2>
          <p className="muted">Post a request and tradespeople can respond. Track responses in the Requests tab.</p>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              setMessage('')
              const selectedSkill = skills.find((s) => s.name === skillName)
              if (!user || !selectedSkill || !title.trim() || !suburb.trim()) {
                setMessage('Enter the job title, suburb, and skill before posting.')
                return
              }
              const nextJob = addClientJob({
                title: title.trim(),
                description: description.trim() || 'Client posted a new request.',
                skill: selectedSkill,
                city: city.trim() || 'Harare',
                suburb: suburb.trim(),
                clientName: user.name,
                clientEmail: user.email,
                budgetMin: Number(budgetMin) || 0,
                budgetMax: Number(budgetMax) || Number(budgetMin) || 0,
                urgency,
              })
              setJobs(readJobs())
              setTitle('')
              setDescription('')
              setSuburb('')
              setBudgetMin('40')
              setBudgetMax('90')
              setUrgency('Flexible')
              setMessage(`Job request posted: "${nextJob.title}". Tradespeople can now see it.`)
            }}
          >
            <div className="form-grid">
              <label>
                Job title
                <input className="text-input" onChange={(e) => setTitle(e.target.value)} placeholder="Fix burst pipe in kitchen" type="text" value={title} />
              </label>
              <label>
                Skill needed
                <select className="text-input" onChange={(e) => setSkillName(e.target.value)} value={skillName}>
                  {skills.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea className="text-input textarea-input" onChange={(e) => setDescription(e.target.value)} placeholder="Tell tradespeople what you need done." value={description} />
            </label>
            <div className="form-grid">
              <label>City<input className="text-input" onChange={(e) => setCity(e.target.value)} placeholder="Harare" type="text" value={city} /></label>
              <label>Suburb<input className="text-input" onChange={(e) => setSuburb(e.target.value)} placeholder="Chitungwiza" type="text" value={suburb} /></label>
            </div>
            <div className="form-grid">
              <label>Budget min<input className="text-input" min="0" onChange={(e) => setBudgetMin(e.target.value)} type="number" value={budgetMin} /></label>
              <label>Budget max<input className="text-input" min="0" onChange={(e) => setBudgetMax(e.target.value)} type="number" value={budgetMax} /></label>
            </div>
            <label>
              Urgency
              <select className="text-input" onChange={(e) => setUrgency(e.target.value as Job['urgency'])} value={urgency}>
                <option value="Flexible">Flexible</option>
                <option value="Urgent">Urgent</option>
                <option value="This Week">This Week</option>
              </select>
            </label>
            {message && <p className="auth-success">{message}</p>}
            <button className="primary-button" type="submit">Post job request</button>
          </form>
        </section>
      )}

      <LocationMap query={mapQuery} title="Job location map" />

      {applyMessage && <p className="auth-success" style={{ padding: '0.5rem 1rem' }}>{applyMessage}</p>}

      <section className="card-grid">
        {filtered.map((job) => {
          const tp = matchedTradesperson(job)
          const isOwnJob = job.clientEmail.trim().toLowerCase() === (user?.email.trim().toLowerCase() ?? '')

          return (
            <article className="job-card" key={job.id}>
              <div className="card-topline">
                <span className="pill">{job.skill.name}</span>
                <span className="status">{job.status}</span>
              </div>
              <h2>{job.title}</h2>
              <p className="muted">{job.suburb}, {job.city}</p>
              {job.description && <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{job.description}</p>}
              <dl className="meta-grid">
                <div><dt>Budget</dt><dd>${job.budgetMin} – ${job.budgetMax}</dd></div>
                <div><dt>Urgency</dt><dd>{job.urgency}</dd></div>
                <div><dt>Applicants</dt><dd>{job.applicants}</dd></div>
              </dl>

              {user?.role === 'tradesperson' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    className="primary-button full-width"
                    type="button"
                    onClick={() => {
                      if (!user) return
                      const result = applyToJob({
                        job,
                        tradespersonName: user.name,
                        tradespersonEmail: user.email,
                        proposedRate: Math.round((job.budgetMin + job.budgetMax) / 2),
                      })
                      setApplyMessage(result.ok ? `Application sent for "${job.title}". Check Requests for updates.` : result.message)
                      setJobs(readJobs())
                    }}
                  >
                    I Can Do This
                  </button>
                  {/* WhatsApp link direct to client */}
                  <a
                    className="whatsapp-button full-width"
                    href={buildWhatsAppLink(job.clientEmail, job.title, user?.name ?? 'A tradesperson')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 WhatsApp Client
                  </a>
                </div>
              )}

              {user?.role === 'client' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="secondary-button full-width" type="button">
                    {isOwnJob ? 'Your request' : 'Open request'}
                  </button>
                  {/* WhatsApp link to a tradesperson who matches this skill */}
                  {tp && (
                    <a
                      className="whatsapp-button full-width"
                      href={buildWhatsAppLink(tp.whatsappNumber, job.title, user.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp a {job.skill.name}
                    </a>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </section>
    </div>
  )
}
