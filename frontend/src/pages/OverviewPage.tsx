import { Link } from 'react-router-dom'
import { LocationMap } from '../components/LocationMap'
import { coverageProvinces, coveredAreas, initialJoinRequests, tradespeople } from '../data/mockData'

export function OverviewPage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <span className="eyebrow">Zimbabwe-first</span>
          <h1>Find reliable tradespeople near you.</h1>
          <div className="hero-actions">
            <Link className="primary-button" to="/tradespeople">
              Browse tradespeople
            </Link>
            <Link className="secondary-button" to="/jobs">
              Explore jobs
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <h2>SkillLink</h2>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <strong>{tradespeople.length}</strong>
          <span>Tradespeople listed across Zimbabwe</span>
        </article>
        <article className="stat-card">
          <strong>{coveredAreas.length}</strong>
          <span>Covered areas in {coverageProvinces.length} provinces</span>
        </article>
        <article className="stat-card">
          <strong>{initialJoinRequests.length}</strong>
          <span>Tradesperson requests waiting for admin review</span>
        </article>
      </section>

      <LocationMap query="" title="Platform coverage map" />
    </div>
  )
}
