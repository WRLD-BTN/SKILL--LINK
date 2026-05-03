export type UserRole = 'client' | 'tradesperson' | 'admin'

export interface Skill {
  id: number
  name: string
  category: string
}

export interface Review {
  id: number
  author: string
  rating: number
  comment: string
}

export interface Tradesperson {
  id: string
  fullName: string
  suburb: string
  city: string
  bio: string
  skills: Skill[]
  hourlyRate: number
  fixedRate?: number
  availability: 'Available Today' | 'Booked' | 'Away'
  whatsappNumber: string
  rating: number
  reviewCount: number
  completedJobs: number
  reviews: Review[]
}

export interface Job {
  id: number
  title: string
  description: string
  skill: Skill
  city: string
  suburb: string
  clientEmail: string
  budgetMin: number
  budgetMax: number
  urgency: 'Flexible' | 'Urgent' | 'This Week'
  status: 'Open' | 'In Progress' | 'Done'
  clientName: string
  applicants: number
}

export interface Application {
  id: number
  jobId: number
  jobTitle: string
  clientName: string
  clientEmail: string
  tradespersonName: string
  tradespersonEmail: string
  suburb: string
  proposedRate: number
  status: 'Pending' | 'Accepted' | 'Completed'
}

export interface NotificationItem {
  id: number
  title: string
  detail: string
  audience: UserRole | 'both'
}

export interface PlatformUser {
  id: string
  fullName: string
  email: string
  phone: string
  suburb: string
  role: UserRole
  status: 'Active' | 'Suspended' | 'Flagged'
  registeredAt: string
}

export interface PlatformReview {
  id: number
  reviewer: string
  target: string
  rating: number
  comment: string
  status: 'Live' | 'Flagged'
}

export interface ReportItem {
  id: number
  type: 'User' | 'Job' | 'Review'
  subject: string
  reason: string
  status: 'Open' | 'Investigating' | 'Resolved'
}

export interface LoginLog {
  id: number
  user: string
  ipAddress: string
  time: string
}

export interface JoinRequest {
  id: string
  fullName: string
  email: string
  phone: string
  suburb: string
  city: string
  primarySkill: string
  yearsExperience: number
  status: 'Pending' | 'Approved' | 'Rejected'
  submittedAt: string
}

export interface CoverageProvince {
  province: string
  city: string
  areas: string[]
  marker: {
    top: number
    left: number
  }
}
