// Auth page handles client account creation, standard sign-in, and tradesperson request submission.
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { submitTradespersonRequest } from '../lib/api'
import { normalizeZimbabwePhone } from '../lib/phone'
import { skills } from '../data/mockData'
import type { UserRole } from '../types'

export function AuthPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authMode, setAuthMode] = useState<'create' | 'signin'>('create')
  const [role, setRole] = useState<UserRole>('client')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('Harare')
  const [phone, setPhone] = useState('')
  const [primarySkill, setPrimarySkill] = useState(skills[0]?.name ?? 'Plumber')
  const [yearsExperience, setYearsExperience] = useState('1')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    if (role === 'admin') {
      setAuthMode('signin')
    }
  }, [role])

  const from = (location.state as { from?: string } | null)?.from
  const buttonLabel =
    role === 'admin'
      ? 'Sign in'
      : authMode === 'create' && role === 'tradesperson'
      ? 'Request admin approval'
      : authMode === 'create'
        ? 'Create account'
        : 'Sign in'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const normalizedPhone = normalizeZimbabwePhone(phone)

    try {
      if (authMode === 'create' && role === 'tradesperson') {
        if (!name.trim() || !normalizedPhone || !suburb.trim() || !password.trim()) {
          setError('Enter your name, phone, suburb, and password before sending a request.')
          return
        }

        const result = await submitTradespersonRequest({
          fullName: name.trim(),
          email: email.trim(),
          phone: normalizedPhone,
          suburb: suburb.trim(),
          city: city.trim() || 'Harare',
          primarySkill,
          yearsExperience: Number(yearsExperience) || 0,
          password,
        })

        setSuccess(result.message)
        navigate(
          `/tradesperson-status?email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(normalizedPhone)}`,
          { replace: true },
        )
        return
      }

      const result = await login({
        mode: authMode,
        name,
        email,
        password,
        phone,
        role,
        suburb,
      })

      if (!result.ok) {
        if (role === 'tradesperson' && result.requiresApproval) {
          navigate(
            `/tradesperson-status?email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(normalizedPhone ?? phone.trim())}`,
            { replace: true },
          )
          return
        }

        setError(result.message ?? 'Unable to sign in.')
        return
      }

      navigate(role === 'admin' ? '/admin' : from || '/dashboard', { replace: true })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to complete this action.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">SkillLink access</span>
        <h1>{authMode === 'create' ? 'Create your account' : 'Sign in to SkillLink'}</h1>

        <div className="auth-switch">
          <button
            className={authMode === 'create' ? 'primary-button' : 'ghost-button'}
            disabled={role === 'admin'}
            onClick={() => setAuthMode('create')}
            type="button"
          >
            Create account
          </button>
          <button
            className={authMode === 'signin' ? 'primary-button' : 'ghost-button'}
            onClick={() => setAuthMode('signin')}
            type="button"
          >
            Sign in
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === 'create' && role !== 'admin' && (
            <label>
              Full name
              <input
                className="text-input"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                type="text"
                value={name}
              />
            </label>
          )}
          {role !== 'admin' && (
            <>
              <label>
                Email
                <input
                  className="text-input"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <p className="field-note">Email is used for sign in. Phone is captured for contact and approval records.</p>
            </>
          )}
          <label>
            Password
            <input
              className="text-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                role === 'admin'
                  ? 'Enter admin password'
                  : authMode === 'create' && role === 'tradesperson'
                    ? 'Choose a password for after approval'
                    : 'Enter your password'
              }
              type="password"
              value={password}
            />
          </label>
          {role !== 'admin' && (
            <>
              <label>
                Phone
                <input
                  className="text-input"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="071 8321438"
                  required
                  type="tel"
                  value={phone}
                />
              </label>
              <label>
                Suburb
                <input
                  className="text-input"
                  onChange={(event) => setSuburb(event.target.value)}
                  placeholder="Mbare, Borrowdale, CBD..."
                  type="text"
                  value={suburb}
                />
              </label>
              <label>
                City
                <input
                  className="text-input"
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Harare or Bulawayo"
                  type="text"
                  value={city}
                />
              </label>
            </>
          )}
          <label>
            Role
            <select className="text-input" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="client">Client</option>
              <option value="tradesperson">Tradesperson</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {authMode === 'create' && role === 'tradesperson' && (
            <div className="form-grid">
              <label>
                Primary skill
                <select className="text-input" onChange={(event) => setPrimarySkill(event.target.value)} value={primarySkill}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Years experience
                <input
                  className="text-input"
                  min="0"
                  onChange={(event) => setYearsExperience(event.target.value)}
                  type="number"
                  value={yearsExperience}
                />
              </label>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="primary-button full-width" disabled={submitting} type="submit">
            {submitting ? 'Please wait...' : buttonLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
