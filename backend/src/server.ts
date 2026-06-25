import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { jobs, skills, tradespeople } from './data/mock.js'
import { sendVerificationSms } from './lib/africasTalking.js'
import { createOtp, verifyOtp } from './lib/otpStore.js'
import { normalizeZimbabwePhone } from './lib/phone.js'
import { supabaseAdmin } from './lib/supabase.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(cors())
app.use(express.json())

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skilllink-api' })
})

// ── Public data ───────────────────────────────────────────────────────────────

app.get('/api/skills', (_req, res) => {
  res.json(skills)
})

app.get('/api/tradespeople', (req, res) => {
  const skill = String(req.query.skill ?? '').toLowerCase()
  const suburb = String(req.query.suburb ?? '').toLowerCase()
  const filtered = tradespeople.filter((p) => {
    const matchesSkill =
      skill.length === 0 ||
      p.skillIds.some((id) =>
        skills.find((s) => s.id === id)?.name.toLowerCase().includes(skill),
      )
    const matchesSuburb = suburb.length === 0 || p.suburb.toLowerCase().includes(suburb)
    return matchesSkill && matchesSuburb
  })
  res.json(filtered)
})

app.get('/api/jobs', (req, res) => {
  const skill = String(req.query.skill ?? '').toLowerCase()
  const suburb = String(req.query.suburb ?? '').toLowerCase()
  const filtered = jobs.filter((j) => {
    const skillName = skills.find((s) => s.id === j.skillId)?.name.toLowerCase() ?? ''
    const matchesSkill = skill.length === 0 || skillName.includes(skill)
    const matchesSuburb = suburb.length === 0 || j.suburb.toLowerCase().includes(suburb)
    return matchesSkill && matchesSuburb
  })
  res.json(filtered)
})

// ── Auth: OTP ─────────────────────────────────────────────────────────────────

app.post('/api/auth/request-otp', async (req, res) => {
  const phone = normalizeZimbabwePhone(String(req.body?.phone ?? ''))
  if (!phone) {
    res.status(400).json({ message: 'Enter a valid Zimbabwean phone number.' })
    return
  }
  try {
    const code = createOtp(phone)
    const result = await sendVerificationSms(phone, code)
    res.json({
      message: result.simulated ? 'Verification code generated for development.' : 'Verification code sent.',
      ...(result.simulated && process.env.NODE_ENV !== 'production' ? { debugCode: code } : {}),
    })
  } catch (error) {
    res.status(502).json({
      message: 'Unable to send verification SMS right now.',
      detail: error instanceof Error ? error.message : 'Unknown SMS provider error.',
    })
  }
})

app.post('/api/auth/verify-otp', (req, res) => {
  const phone = normalizeZimbabwePhone(String(req.body?.phone ?? ''))
  const code = String(req.body?.code ?? '').trim()
  if (!phone) { res.status(400).json({ message: 'Enter a valid Zimbabwean phone number.' }); return }
  if (!code) { res.status(400).json({ message: 'Enter the verification code.' }); return }
  const result = verifyOtp(phone, code)
  if (!result.ok) { res.status(400).json(result); return }
  res.json(result)
})

// ── Auth: access (sign-in / create account) ───────────────────────────────────

app.post('/api/auth/access', async (req, res) => {
  const { mode, name, phone, email, suburb, role, password } = req.body ?? {}

  if (!email || !password || !role) {
    res.status(400).json({ ok: false, message: 'Email, password and role are required.' })
    return
  }

  // Admin shortcut — credentials stored in env / adminCredentials store
  if (role === 'admin') {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skilllink.co.zw'
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
    if (email !== adminEmail || password !== adminPassword) {
      res.status(401).json({ ok: false, message: 'Invalid admin credentials.' })
      return
    }
    res.json({
      ok: true,
      user: { name: 'Admin', email, phone: '', role: 'admin', suburb: '' },
    })
    return
  }

  // Tradesperson — must be approved before they can sign in
  if (role === 'tradesperson') {
    if (!supabaseAdmin) {
      res.status(503).json({ ok: false, message: 'Database not configured.' })
      return
    }
    const { data: request } = await supabaseAdmin
      .from('join_requests')
      .select('*')
      .eq('email', email)
      .single()

    if (!request) {
      res.status(404).json({ ok: false, message: 'No application found for this email.' })
      return
    }
    if (request.status === 'Pending') {
      res.json({ ok: false, requiresApproval: true, status: 'Pending', message: 'Your application is pending approval.' })
      return
    }
    if (request.status === 'Rejected') {
      res.json({ ok: false, requiresApproval: true, status: 'Rejected', message: 'Your application was rejected.' })
      return
    }
    // Approved — return user
    res.json({
      ok: true,
      user: {
        name: request.fullName,
        email: request.email,
        phone: request.phone,
        role: 'tradesperson',
        suburb: request.suburb,
      },
    })
    return
  }

  // Client — create or sign in
  if (!supabaseAdmin) {
    // No DB configured: accept any client in dev
    res.json({
      ok: true,
      user: { name: name ?? email, email, phone: phone ?? '', role: 'client', suburb: suburb ?? '' },
    })
    return
  }

  if (mode === 'create') {
    const { error } = await supabaseAdmin
      .from('users')
      .insert({ fullName: name, email, phone, suburb, role: 'client', status: 'Active', registeredAt: new Date().toISOString() })

    if (error) {
      res.status(400).json({ ok: false, message: error.message })
      return
    }
    res.json({ ok: true, user: { name, email, phone, role: 'client', suburb } })
    return
  }

  // signin
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('email', email).single()
  if (!user) {
    res.status(404).json({ ok: false, message: 'No account found with that email.' })
    return
  }
  res.json({ ok: true, user: { name: user.fullName, email: user.email, phone: user.phone, role: user.role, suburb: user.suburb } })
})

// ── Auth: tradesperson request ────────────────────────────────────────────────

app.post('/api/auth/tradesperson-request', async (req, res) => {
  const { fullName, email, phone, suburb, city, primarySkill, yearsExperience } = req.body ?? {}

  if (!fullName || !email || !phone) {
    res.status(400).json({ ok: false, message: 'Full name, email and phone are required.' })
    return
  }

  const newRequest = {
    id: crypto.randomUUID(),
    fullName,
    email,
    phone,
    suburb,
    city,
    primarySkill,
    yearsExperience: Number(yearsExperience ?? 0),
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  }

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from('join_requests').insert(newRequest)
    if (error) {
      res.status(400).json({ ok: false, message: error.message })
      return
    }
  }

  res.json({ ok: true, message: 'Application submitted successfully.', request: newRequest })
})

// ── Auth: tradesperson status ─────────────────────────────────────────────────

app.get('/api/auth/tradesperson-status', async (req, res) => {
  const email = String(req.query.email ?? '')
  const phone = String(req.query.phone ?? '')

  if (!email && !phone) {
    res.status(400).json({ ok: false, message: 'Provide email or phone.' })
    return
  }

  if (!supabaseAdmin) {
    res.status(503).json({ ok: false, message: 'Database not configured.' })
    return
  }

  let query = supabaseAdmin.from('join_requests').select('*')
  if (email) query = query.eq('email', email)
  else query = query.eq('phone', phone)

  const { data, error } = await query.single()
  if (error || !data) {
    res.status(404).json({ ok: false, message: 'No application found.' })
    return
  }
  res.json({ ok: true, status: data })
})

// ── Admin: users ──────────────────────────────────────────────────────────────

app.get('/api/admin/users', async (_req, res) => {
  if (!supabaseAdmin) { res.json([]); return }
  const { data, error } = await supabaseAdmin.from('users').select('*').order('registeredAt', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

app.patch('/api/admin/users/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body ?? {}
  if (!supabaseAdmin) { res.status(503).json({ ok: false, message: 'Database not configured.' }); return }
  const { data, error } = await supabaseAdmin.from('users').update({ status }).eq('id', id).select().single()
  if (error) { res.status(400).json({ ok: false, message: error.message }); return }
  res.json({ ok: true, user: data })
})

app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params
  if (!supabaseAdmin) { res.status(503).json({ ok: false, message: 'Database not configured.' }); return }
  const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
  if (error) { res.status(400).json({ ok: false, message: error.message }); return }
  res.json({ ok: true })
})

// ── Admin: join requests ──────────────────────────────────────────────────────

app.get('/api/admin/requests', async (_req, res) => {
  if (!supabaseAdmin) { res.json([]); return }
  const { data, error } = await supabaseAdmin.from('join_requests').select('*').order('submittedAt', { ascending: false })
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

app.get('/api/admin/requests/:id', async (req, res) => {
  const { id } = req.params
  if (!supabaseAdmin) { res.status(503).json({ ok: false, message: 'Database not configured.' }); return }
  const { data, error } = await supabaseAdmin.from('join_requests').select('*').eq('id', id).single()
  if (error || !data) { res.status(404).json({ ok: false, message: 'Request not found.' }); return }
  res.json({ ok: true, request: data })
})

app.post('/api/admin/requests/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body ?? {}
  if (!supabaseAdmin) { res.status(503).json({ ok: false, message: 'Database not configured.' }); return }
  const { data, error } = await supabaseAdmin.from('join_requests').update({ status }).eq('id', id).select().single()
  if (error) { res.status(400).json({ ok: false, message: error.message }); return }
  res.json({ ok: true, request: data })
})

// ── Admin: change password ────────────────────────────────────────────────────

app.post('/api/admin/change-password', (req, res) => {
  const { email, originalAdminPassword, newPassword } = req.body ?? {}
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skilllink.co.zw'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

  if (email !== adminEmail || originalAdminPassword !== adminPassword) {
    res.status(401).json({ ok: false, message: 'Current credentials are incorrect.' })
    return
  }
  // In production you would persist this; for now acknowledge the change
  res.json({ ok: true, message: 'Password updated. Set ADMIN_PASSWORD in your .env to persist it.' })
})

// ─────────────────────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`SkillLink API listening on http://localhost:${port}`)
})