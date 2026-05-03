export interface BackendSkill {
  id: number
  name: string
  category: string
}

export interface BackendTradesperson {
  id: string
  fullName: string
  suburb: string
  city: string
  skillIds: number[]
  hourlyRate: number
  rating: number
  whatsappNumber: string
}

export interface BackendJob {
  id: number
  title: string
  skillId: number
  suburb: string
  city: string
  status: string
}

export const skills: BackendSkill[] = [
  { id: 1, name: 'Plumber', category: 'Home Services' },
  { id: 2, name: 'Electrician', category: 'Home Services' },
  { id: 3, name: 'Carpenter', category: 'Home Services' },
  { id: 4, name: 'Welder', category: 'Construction' },
]

export const tradespeople: BackendTradesperson[] = [
  {
    id: 'tp-1',
    fullName: 'Tawanda Moyo',
    suburb: 'Mbare',
    city: 'Harare',
    skillIds: [1],
    hourlyRate: 18,
    rating: 4.8,
    whatsappNumber: '263771234567',
  },
  {
    id: 'tp-2',
    fullName: 'Prince Ncube',
    suburb: 'Borrowdale',
    city: 'Harare',
    skillIds: [2],
    hourlyRate: 22,
    rating: 4.6,
    whatsappNumber: '263772345678',
  },
]

export const jobs: BackendJob[] = [
  {
    id: 101,
    title: 'Fix leaking kitchen sink',
    skillId: 1,
    suburb: 'Avondale',
    city: 'Harare',
    status: 'Open',
  },
  {
    id: 102,
    title: 'Install outside security light',
    skillId: 2,
    suburb: 'Greendale',
    city: 'Harare',
    status: 'Open',
  },
]
