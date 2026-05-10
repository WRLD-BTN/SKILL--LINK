import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { jobs, skills, tradespeople } from './data/mock.js'
import { sendVerificationSms } from './lib/africasTalking.js'
import { createOtp, verifyOtp } from './lib/otpStore.js'
import { normalizeZimbabwePhone } from './lib/phone.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(cors())
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'skilllink-api' })
})

app.get('/api/skills', (_request, response) => {
  response.json(skills)
})

app.get('/api/tradespeople', (request, response) => {
  const skill = String(request.query.skill ?? '').toLowerCase()
  const suburb = String(request.query.suburb ?? '').toLowerCase()

  const filtered = tradespeople.filter((person) => {
    const matchesSkill =
      skill.length === 0 ||
      person.skillIds.some((skillId) =>
        skills.find((entry) => entry.id === skillId)?.name.toLowerCase().includes(skill),
      )
    const matchesSuburb = suburb.length === 0 || person.suburb.toLowerCase().includes(suburb)

    return matchesSkill && matchesSuburb
  })

  response.json(filtered)
})

app.get('/api/jobs', (request, response) => {
  const skill = String(request.query.skill ?? '').toLowerCase()
  const suburb = String(request.query.suburb ?? '').toLowerCase()

  const filtered = jobs.filter((job) => {
    const skillName = skills.find((entry) => entry.id === job.skillId)?.name.toLowerCase() ?? ''
    const matchesSkill = skill.length === 0 || skillName.includes(skill)
    const matchesSuburb = suburb.length === 0 || job.suburb.toLowerCase().includes(suburb)

    return matchesSkill && matchesSuburb
  })

  response.json(filtered)
})

app.post('/api/auth/request-otp', async (request, response) => {
  const phone = normalizeZimbabwePhone(String(request.body?.phone ?? ''))

  if (!phone) {
    response.status(400).json({ message: 'Enter a valid Zimbabwean phone number.' })
    return
  }

  try {
    const code = createOtp(phone)
    const result = await sendVerificationSms(phone, code)

    response.json({
      message: result.simulated ? 'Verification code generated for development.' : 'Verification code sent.',
      ...(result.simulated && process.env.NODE_ENV !== 'production' ? { debugCode: code } : {}),
    })
  } catch (error) {
    response.status(502).json({
      message: 'Unable to send verification SMS right now.',
      detail: error instanceof Error ? error.message : 'Unknown SMS provider error.',
    })
  }
})

app.post('/api/auth/verify-otp', (request, response) => {
  const phone = normalizeZimbabwePhone(String(request.body?.phone ?? ''))
  const code = String(request.body?.code ?? '').trim()

  if (!phone) {
    response.status(400).json({ message: 'Enter a valid Zimbabwean phone number.' })
    return
  }

  if (!code) {
    response.status(400).json({ message: 'Enter the verification code.' })
    return
  }

  const result = verifyOtp(phone, code)

  if (!result.ok) {
    response.status(400).json(result)
    return
  }

  response.json(result)
})

app.listen(port, () => {
  console.log(`SkillLink API listening on http://localhost:${port}`)
})
