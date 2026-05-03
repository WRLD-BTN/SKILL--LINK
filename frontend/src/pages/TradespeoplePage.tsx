import { useMemo, useState } from 'react'
import { LocationMap } from '../components/LocationMap'
import { tradespeople } from '../data/mockData'

export function TradespeoplePage() {
  const [skillFilter, setSkillFilter] = useState('')
  const [suburbFilter, setSuburbFilter] = useState('')

  const filtered = useMemo(
    () =>
      tradespeople.filter((person) => {
        const matchesSkill =
          skillFilter.length === 0 ||
          person.skills.some((skill) => skill.name.toLowerCase().includes(skillFilter.toLowerCase()))
        const matchesSuburb =
          suburbFilter.length === 0 ||
          person.suburb.toLowerCase().includes(suburbFilter.toLowerCase())

        return matchesSkill && matchesSuburb
      }),
    [skillFilter, suburbFilter],
  )

  const mapQuery =
    suburbFilter.trim().length > 0
      ? `${suburbFilter.trim()}, Zimbabwe`
      : filtered[0]
        ? `${filtered[0].suburb}, ${filtered[0].city}, Zimbabwe`
        : 'Harare, Zimbabwe'

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">For clients</span>
          <h1>Find a tradesperson</h1>
        </div>
        <div className="filter-row">
          <input
            className="text-input"
            placeholder="Search skill"
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
          />
          <input
            className="text-input"
            placeholder="Search suburb"
            value={suburbFilter}
            onChange={(event) => setSuburbFilter(event.target.value)}
          />
        </div>
      </section>

      <LocationMap query={mapQuery} title="Tradespeople coverage map" />

      <section className="card-grid">
        {filtered.map((person) => (
          <article className="profile-card" key={person.id}>
            <div className="card-topline">
              <span className="availability">{person.availability}</span>
              <span className="rating">{person.rating.toFixed(1)} / 5</span>
            </div>
            <h2>{person.fullName}</h2>
            <p className="muted">
              {person.suburb}, {person.city}
            </p>
            <div className="pill-row">
              {person.skills.map((skill) => (
                <span className="pill" key={skill.id}>
                  {skill.name}
                </span>
              ))}
            </div>
            <dl className="meta-grid">
              <div>
                <dt>Hourly rate</dt>
                <dd>${person.hourlyRate}/hr</dd>
              </div>
              <div>
                <dt>Completed jobs</dt>
                <dd>{person.completedJobs}</dd>
              </div>
              <div>
                <dt>Reviews</dt>
                <dd>{person.reviewCount}</dd>
              </div>
            </dl>
            <a
              className="primary-button full-width"
              href={`https://wa.me/${person.whatsappNumber}`}
              rel="noreferrer"
              target="_blank"
            >
              Contact on WhatsApp
            </a>
          </article>
        ))}
      </section>
    </div>
  )
}
