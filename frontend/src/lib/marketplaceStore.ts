import { applications as seededApplications, jobs as seededJobs } from '../data/mockData'
import type { Application, Job, Skill } from '../types'

const jobsKey = 'skilllink-jobs'
const applicationsKey = 'skilllink-applications'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readJobs() {
  if (!canUseStorage()) {
    return seededJobs
  }

  const saved = window.localStorage.getItem(jobsKey)

  if (!saved) {
    window.localStorage.setItem(jobsKey, JSON.stringify(seededJobs))
    return seededJobs
  }

  try {
    return JSON.parse(saved) as Job[]
  } catch {
    window.localStorage.setItem(jobsKey, JSON.stringify(seededJobs))
    return seededJobs
  }
}

export function writeJobs(jobs: Job[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(jobsKey, JSON.stringify(jobs))
}

export function readApplications() {
  if (!canUseStorage()) {
    return seededApplications
  }

  const saved = window.localStorage.getItem(applicationsKey)

  if (!saved) {
    window.localStorage.setItem(applicationsKey, JSON.stringify(seededApplications))
    return seededApplications
  }

  try {
    return JSON.parse(saved) as Application[]
  } catch {
    window.localStorage.setItem(applicationsKey, JSON.stringify(seededApplications))
    return seededApplications
  }
}

export function writeApplications(applications: Application[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(applicationsKey, JSON.stringify(applications))
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

  const nextJobs = [nextJob, ...jobs]
  writeJobs(nextJobs)
  return nextJob
}

export function applyToJob(input: {
  job: Job
  tradespersonName: string
  tradespersonEmail: string
  proposedRate: number
}) {
  const applications = readApplications()
  const exists = applications.some(
    (application) =>
      application.jobId === input.job.id &&
      application.tradespersonEmail.trim().toLowerCase() === input.tradespersonEmail.trim().toLowerCase(),
  )

  if (exists) {
    return { ok: false as const, message: 'You already applied to this job.' }
  }

  const nextApplication: Application = {
    id: applications.reduce((max, application) => Math.max(max, application.id), 0) + 1,
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

  const nextApplications = [nextApplication, ...applications]
  writeApplications(nextApplications)

  const nextJobs = readJobs().map((job) =>
    job.id === input.job.id ? { ...job, applicants: job.applicants + 1 } : job,
  )
  writeJobs(nextJobs)

  return { ok: true as const, application: nextApplication }
}
