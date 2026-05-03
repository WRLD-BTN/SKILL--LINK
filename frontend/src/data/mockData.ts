import type {
  Application,
  CoverageProvince,
  Job,
  JoinRequest,
  LoginLog,
  NotificationItem,
  PlatformReview,
  PlatformUser,
  ReportItem,
  Skill,
  Tradesperson,
} from '../types'

export const skills: Skill[] = [
  { id: 1, name: 'Plumber', category: 'Home Services' },
  { id: 2, name: 'Electrician', category: 'Home Services' },
  { id: 3, name: 'Carpenter', category: 'Home Services' },
  { id: 4, name: 'Welder', category: 'Construction' },
  { id: 5, name: 'Painter', category: 'Home Services' },
  { id: 6, name: 'Tiler', category: 'Construction' },
  { id: 7, name: 'Roofer', category: 'Construction' },
  { id: 8, name: 'Mechanic', category: 'Auto' },
  { id: 9, name: 'Gardener', category: 'Outdoor' },
  { id: 10, name: 'Mason', category: 'Construction' },
]

export const coverageProvinces: CoverageProvince[] = [
  {
    province: 'Harare',
    city: 'Harare',
    areas: ['Mbare', 'Highfield', 'Borrowdale', 'Avondale', 'Epworth'],
    marker: { top: 35, left: 58 },
  },
  {
    province: 'Bulawayo',
    city: 'Bulawayo',
    areas: ['CBD', 'Nkulumane', 'Luveve', 'Cowdray Park'],
    marker: { top: 56, left: 25 },
  },
  {
    province: 'Manicaland',
    city: 'Mutare',
    areas: ['Sakubva', 'Dangamvura', 'Rusape', 'Chipinge', 'Nyanga'],
    marker: { top: 50, left: 76 },
  },
  {
    province: 'Mashonaland Central',
    city: 'Bindura',
    areas: ['Bindura', 'Glendale', 'Mazowe', 'Guruve'],
    marker: { top: 23, left: 52 },
  },
  {
    province: 'Mashonaland East',
    city: 'Marondera',
    areas: ['Chitungwiza', 'Ruwa', 'Marondera', 'Murehwa', 'Mutoko'],
    marker: { top: 38, left: 67 },
  },
  {
    province: 'Mashonaland West',
    city: 'Chinhoyi',
    areas: ['Chinhoyi', 'Kadoma', 'Karoi', 'Norton', 'Banket'],
    marker: { top: 34, left: 40 },
  },
  {
    province: 'Masvingo',
    city: 'Masvingo',
    areas: ['Mucheke', 'Masvingo CBD', 'Chiredzi', 'Triangle', 'Gutu'],
    marker: { top: 73, left: 59 },
  },
  {
    province: 'Matabeleland North',
    city: 'Hwange',
    areas: ['Hwange', 'Victoria Falls', 'Lupane', 'Binga'],
    marker: { top: 28, left: 24 },
  },
  {
    province: 'Matabeleland South',
    city: 'Gwanda',
    areas: ['Gwanda', 'Beitbridge', 'Plumtree', 'Filabusi'],
    marker: { top: 74, left: 30 },
  },
  {
    province: 'Midlands',
    city: 'Gweru',
    areas: ['Gweru', 'Kwekwe', 'Redcliff', 'Zvishavane', 'Shurugwi'],
    marker: { top: 50, left: 46 },
  },
]

type CoverageArea = {
  province: string
  city: string
  area: string
}

export const coveredAreas: CoverageArea[] = coverageProvinces.flatMap((province) =>
  province.areas.map((area) => ({
    province: province.province,
    city: province.city,
    area,
  })),
)

const firstNames = [
  'Tawanda', 'Rumbidzai', 'Prince', 'Ashley', 'Farai', 'Tanaka', 'Munashe', 'Kundai', 'Tapiwa', 'Rutendo',
  'Nyasha', 'Tinashe', 'Shamiso', 'Anesu', 'Mandla', 'Sipho', 'Nomsa', 'Buhle', 'Tatenda', 'Panashe',
  'Brian', 'Shingi', 'Melody', 'Tendai', 'Blessing', 'Valerie', 'Mike', 'Tonderai', 'Mavis', 'Pardon',
]

const lastNames = [
  'Moyo', 'Ncube', 'Dube', 'Sibanda', 'Zhou', 'Chari', 'Mpofu', 'Mhlanga', 'Maregere', 'Chinembiri',
  'Maphosa', 'Mlotshwa', 'Mangena', 'Nyoni', 'Muzenda', 'Mupfumi', 'Jena', 'Tshuma', 'Khumalo', 'Madzimure',
]

const biosBySkill: Record<string, string> = {
  Plumber: 'Fast domestic repairs, burst pipes, tanks, taps, and bathroom fittings.',
  Electrician: 'Fault finding, home rewiring, fittings, prepaid meter work, and safety checks.',
  Carpenter: 'Cupboards, wardrobes, shelving, doors, roofing timber, and repairs.',
  Welder: 'Security gates, burglar bars, steel frames, and fabrication for homes or shops.',
  Painter: 'Interior and exterior painting, prep work, patching, and finishing.',
  Tiler: 'Floor and wall tiling, bathroom finishes, kitchen backsplashes, and grouting.',
  Roofer: 'Roof leaks, sheeting, waterproofing, gutters, and storm repairs.',
  Mechanic: 'Minor service jobs, diagnostics, brakes, and roadside troubleshooting.',
  Gardener: 'Yard cleanups, hedge trimming, grass maintenance, and landscape touch-ups.',
  Mason: 'Boundary walls, paving, plastering, foundations, and blockwork.',
}

const reviewComments = [
  'Arrived on time and finished neatly.',
  'Good communication and fair pricing.',
  'Quick turnaround and solid workmanship.',
  'Professional job and easy WhatsApp coordination.',
  'Clean finish and explained the repair clearly.',
]

const jobTemplates = [
  'Fix leaking kitchen sink',
  'Install outside security light',
  'Build fitted shelves',
  'Weld a security gate',
  'Paint two-room cottage',
  'Retile bathroom floor',
  'Repair roof leak',
  'Service family car',
  'Clear overgrown yard',
  'Build a boundary wall section',
]

const urgencies: Job['urgency'][] = ['Flexible', 'Urgent', 'This Week']
const jobStatuses: Job['status'][] = ['Open', 'In Progress', 'Done']
const applicationStatuses: Application['status'][] = ['Pending', 'Accepted', 'Completed']
const requestStatuses: JoinRequest['status'][] = ['Pending', 'Pending', 'Pending', 'Approved', 'Rejected']

function makePhone(index: number) {
  return `+26377${String(1000000 + index).padStart(7, '0')}`
}

function makePersonName(index: number) {
  return `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`
}

function makeEmail(name: string, suffix: string) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${suffix}.skilllink.test`
}

export const tradespeople: Tradesperson[] = Array.from({ length: 52 }, (_, index) => {
  const area = coveredAreas[index % coveredAreas.length]
  const primarySkill = skills[index % skills.length]
  const secondarySkill = skills[(index + 3) % skills.length]
  const name = makePersonName(index)
  const rating = Number((4.1 + (index % 9) * 0.1).toFixed(1))
  const reviewCount = 8 + (index % 18)
  const hourlyRate = 15 + (index % 7) * 3
  const fixedRate = hourlyRate * 3 + 12

  return {
    id: `tp-${index + 1}`,
    fullName: name,
    suburb: area.area,
    city: area.city,
    bio: biosBySkill[primarySkill.name],
    skills: index % 4 === 0 ? [primarySkill, secondarySkill] : [primarySkill],
    hourlyRate,
    fixedRate,
    availability: (['Available Today', 'Booked', 'Away'] as Tradesperson['availability'][])[index % 3],
    whatsappNumber: makePhone(index + 1).replace('+', ''),
    rating,
    reviewCount,
    completedJobs: 14 + index * 2,
    reviews: [
      {
        id: index * 2 + 1,
        author: firstNames[(index + 5) % firstNames.length],
        rating: Math.min(5, Math.max(4, Math.round(rating))),
        comment: reviewComments[index % reviewComments.length],
      },
      {
        id: index * 2 + 2,
        author: firstNames[(index + 9) % firstNames.length],
        rating: 4,
        comment: reviewComments[(index + 2) % reviewComments.length],
      },
    ],
  }
})

const clientNames = Array.from({ length: 22 }, (_, index) => makePersonName(index + 60))

export const jobs: Job[] = Array.from({ length: 20 }, (_, index) => {
  const area = coveredAreas[(index * 2) % coveredAreas.length]
  const skill = skills[index % skills.length]
  const budgetMin = 35 + index * 4

  return {
    id: 101 + index,
    title: `${jobTemplates[index % jobTemplates.length]} - ${area.area}`,
    description: `${jobTemplates[index % jobTemplates.length]} needed in ${area.area}, ${area.city}.`,
    skill,
    city: area.city,
    suburb: area.area,
    clientEmail: makeEmail(clientNames[index % clientNames.length], 'client'),
    budgetMin,
    budgetMax: budgetMin + 35,
    urgency: urgencies[index % urgencies.length],
    status: jobStatuses[index % jobStatuses.length],
    clientName: clientNames[index % clientNames.length],
    applicants: 2 + (index % 6),
  }
})

export const clientJobs = jobs.slice(0, 8)

export const applications: Application[] = jobs.slice(0, 12).map((job, index) => ({
  id: index + 1,
  jobId: job.id,
  jobTitle: job.title,
  clientName: job.clientName,
  clientEmail: job.clientEmail,
  tradespersonName: tradespeople[index % tradespeople.length].fullName,
  tradespersonEmail: makeEmail(tradespeople[index % tradespeople.length].fullName, 'pro'),
  suburb: job.suburb,
  proposedRate: job.budgetMin + 5 + (index % 3) * 8,
  status: applicationStatuses[index % applicationStatuses.length],
}))

export const notifications: NotificationItem[] = [
  {
    id: 1,
    title: 'New applicant for your Harare plumbing job',
    detail: 'A verified plumber from Chitungwiza just applied.',
    audience: 'client',
  },
  {
    id: 2,
    title: 'New roofing job near Cowdray Park',
    detail: 'A same-day roof leak job was posted in Bulawayo.',
    audience: 'tradesperson',
  },
  {
    id: 3,
    title: 'Coverage now spans all provinces',
    detail: 'The platform now lists tradespeople across Zimbabwe.',
    audience: 'both',
  },
  {
    id: 4,
    title: 'Thirty join requests need review',
    detail: 'Admin has a larger verification queue this morning.',
    audience: 'admin',
  },
]

const generatedTradespersonUsers: PlatformUser[] = tradespeople.map((person, index) => ({
  id: `u-tp-${index + 1}`,
  fullName: person.fullName,
  email: index % 5 === 0 ? '' : makeEmail(person.fullName, 'pro'),
  phone: makePhone(index + 1),
  suburb: person.suburb,
  role: 'tradesperson',
  status: index % 13 === 0 ? 'Flagged' : 'Active',
  registeredAt: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
}))

const generatedClientUsers: PlatformUser[] = clientNames.map((name, index) => ({
  id: `u-client-${index + 1}`,
  fullName: name,
  email: index % 4 === 0 ? '' : makeEmail(name, 'client'),
  phone: makePhone(200 + index),
  suburb: coveredAreas[(index * 3) % coveredAreas.length].area,
  role: 'client',
  status: index % 11 === 0 ? 'Suspended' : 'Active',
  registeredAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}`,
}))

export const platformUsers: PlatformUser[] = [
  {
    id: 'u-admin-1',
    fullName: 'Admin User',
    email: 'admin@skilllink.test',
    phone: '+263771111111',
    suburb: 'Avondale',
    role: 'admin',
    status: 'Active',
    registeredAt: '2026-02-01',
  },
  ...generatedClientUsers,
  ...generatedTradespersonUsers,
]

export const platformReviews: PlatformReview[] = tradespeople.slice(0, 8).map((person, index) => ({
  id: index + 1,
  reviewer: firstNames[(index + 7) % firstNames.length],
  target: person.fullName,
  rating: index % 4 === 0 ? 2 : 4 + (index % 2),
  comment: reviewComments[(index + 1) % reviewComments.length],
  status: index % 4 === 0 ? 'Flagged' : 'Live',
}))

export const reports: ReportItem[] = [
  {
    id: 1,
    type: 'User',
    subject: tradespeople[6].fullName,
    reason: 'Repeated missed callouts in Norton and Chinhoyi.',
    status: 'Investigating',
  },
  {
    id: 2,
    type: 'Job',
    subject: jobs[5].title,
    reason: 'Budget looks unrealistic and needs a manual check.',
    status: 'Open',
  },
  {
    id: 3,
    type: 'Review',
    subject: `Review #${platformReviews[0].id}`,
    reason: 'Possible abuse in the wording of a low rating.',
    status: 'Open',
  },
  {
    id: 4,
    type: 'User',
    subject: tradespeople[18].fullName,
    reason: 'Identity documents requested after multiple complaints.',
    status: 'Resolved',
  },
]

export const loginLogs: LoginLog[] = [
  { id: 1, user: 'Admin User', ipAddress: '196.29.53.14', time: '2026-04-28 08:15' },
  { id: 2, user: clientNames[0], ipAddress: '102.177.44.91', time: '2026-04-28 07:51' },
  { id: 3, user: tradespeople[0].fullName, ipAddress: '154.120.200.17', time: '2026-04-27 21:04' },
  { id: 4, user: tradespeople[11].fullName, ipAddress: '41.60.4.22', time: '2026-04-27 18:43' },
  { id: 5, user: clientNames[5], ipAddress: '197.221.252.60', time: '2026-04-27 17:12' },
]

export const initialJoinRequests: JoinRequest[] = Array.from({ length: 30 }, (_, index) => {
  const area = coveredAreas[(index + 9) % coveredAreas.length]
  const skill = skills[(index + 2) % skills.length]
  const name = makePersonName(index + 110)

  return {
    id: `jr-${index + 1}`,
    fullName: name,
    email: index % 6 === 0 ? '' : makeEmail(name, 'join'),
    phone: makePhone(500 + index),
    suburb: area.area,
    city: area.city,
    primarySkill: skill.name,
    yearsExperience: 2 + (index % 12),
    status: requestStatuses[index % requestStatuses.length],
    submittedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')} ${String(8 + (index % 9)).padStart(2, '0')}:${index % 2 === 0 ? '15' : '40'}`,
  }
})
