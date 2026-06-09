import { applications as seededApplications, jobs as seededJobs } from '../data/mockData'
import type { Application, Job, Skill } from '../types'

const jobsKey = 'skilllink-jobs'
const applicationsKey = 'skilllink-applications'
const messagesKey = 'skilllink-messages'

export interface Message {
  id: number
  requestId: number  // links to Application id
  jobId: number
  senderId: string   // email
  senderName: string
  receiverId: string // email
  text: string
  timestamp: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readJobs() {
  if (!canUseStorage()) return seededJobs
  const saved = window.localStorage.getItem(jobsKey)
  if (!saved) { window.localStorage.setItem(jobsKey, JSON.stringify(seededJobs)); return seededJobs }
  try { return JSON.parse(saved) as Job[] } catch { window.localStorage.setItem(jobsKey, JSON.stringify(seededJobs)); return seededJobs }
}

export function writeJobs(jobs: Job[]) {
  if (canUseStorage()) window.localStorage.setItem(jobsKey, JSON.stringify(jobs))
}

export function readApplications() {
  if (!canUseStorage()) return seededApplications
  const saved = window.localStorage.getItem(applicationsKey)
  if (!saved) { window.localStorage.setItem(applicationsKey, JSON.stringify(seededApplications)); return seededApplications }
  try { return JSON.parse(saved) as Application[] } catch { window.localStorage.setItem(applicationsKey, JSON.stringify(seededApplications)); return seededApplications }
}

export function writeApplications(applications: Application[]) {
  if (canUseStorage()) window.localStorage.setItem(applicationsKey, JSON.stringify(applications))
}

export function readMessages(): Message[] {
  if (!canUseStorage()) return []
  const saved = window.localStorage.getItem(messagesKey)
  if (!saved) return []
  try { return JSON.parse(saved) as Message[] } catch { return [] }
}

export function writeMessages(messages: Message[]) {
  if (canUseStorage()) window.localStorage.setItem(messagesKey, JSON.stringify(messages))
}

export function sendMessage(input: {
  requestId: number
  jobId: number
  senderId: string
  senderName: string
  receiverId: string
  text: string
}): Message {
  const messages = readMessages()
  const next: Message = {
    id: messages.reduce((max, m) => Math.max(max, m.id), 0) + 1,
    requestId: input.requestId,
    jobId: input.jobId,
    senderId: input.senderId,
    senderName: input.senderName,
    receiverId: input.receiverId,
    text: input.text,
    timestamp: new Date().toISOString(),
  }
  writeMessages([...messages, next])
  return next
}

export function getMessagesForRequest(requestId: number): Message[] {
  return readMessages().filter((m) => m.requestId === requestId)
}

export function addClientJob(input: {
  title: string
  description: string
  skill: Skill
  city: string
  suburb: string
  clientName: string
  clientEmail: string
  budgetMin: number
  budgetMax: number
  urgency: Job['urgency']
}) {
  const jobs = readJobs()
  const nextJob: Job = {
    id: jobs.reduce((max, job) => Math.max(max, job.id), 100) + 1,
    title: input.title,
    description: input.description,
    skill: input.skill,
    city: input.city,
    suburb: input.suburb,
    clientEmail: input.clientEmail,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    urgency: input.urgency,
    status: 'Open',
    clientName: input.clientName,
    applicants: 0,
  }
  writeJobs([nextJob, ...jobs])
  return nextJob
}

export function applyToJob(input: {
  job: Job
  tradespersonName: string
  tradespersonEmail: string
  tradespersonPhone?: string
  proposedRate: number
}) {
  const applications = readApplications()
  const exists = applications.some(
    (a) =>
      a.jobId === input.job.id &&
      a.tradespersonEmail.trim().toLowerCase() === input.tradespersonEmail.trim().toLowerCase(),
  )
  if (exists) return { ok: false as const, message: 'You already applied to this job.' }

  const nextApplication: Application = {
    id: applications.reduce((max, a) => Math.max(max, a.id), 0) + 1,
    jobId: input.job.id,
    jobTitle: input.job.title,
    clientName: input.job.clientName,
    clientEmail: input.job.clientEmail,
    tradespersonName: input.tradespersonName,
    tradespersonEmail: input.tradespersonEmail,
    suburb: input.job.suburb,
    proposedRate: input.proposedRate,
    status: 'Pending',
  }

  writeApplications([nextApplication, ...applications])
  writeJobs(readJobs().map((job) =>
    job.id === input.job.id ? { ...job, applicants: job.applicants + 1 } : job,
  ))

  return { ok: true as const, application: nextApplication }
}

export function acceptApplication(applicationId: number) {
  const applications = readApplications()
  const updated = applications.map((a) =>
    a.id === applicationId ? { ...a, status: 'Accepted' as const } : a,
  )
  writeApplications(updated)
  const accepted = updated.find((a) => a.id === applicationId)
  if (accepted) {
    writeJobs(readJobs().map((job) =>
      job.id === accepted.jobId ? { ...job, status: 'In Progress' as const } : job,
    ))
  }
  return updated
}

export function rejectApplication(applicationId: number) {
  const applications = readApplications()
  const updated = applications.map((a) =>
    a.id === applicationId ? { ...a, status: 'Pending' as const } : a,
  )
  writeApplications(updated)
  return updated
}
