import { LocationMap } from '../components/LocationMap'
import { tradespeople } from '../data/mockData'

export function ProfilePage() {
  const person = tradespeople[0]

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Tradesperson profile</span>
          <h1>{person.fullName}</h1>
          <p>
            {person.suburb}, {person.city} · {person.availability}
          </p>
        </div>
        <a
          className="primary-button"
          href={`https://wa.me/${person.whatsappNumber}`}
          rel="noreferrer"
          target="_blank"
        >
          Contact on WhatsApp
        </a>
      </section>

      <section className="split-layout">
        <div className="panel">
          <h2>About</h2>
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
              <dt>Fixed rate</dt>
              <dd>${person.fixedRate}</dd>
            </div>
            <div>
              <dt>Jobs completed</dt>
              <dd>{person.completedJobs}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>
                {person.rating} from {person.reviewCount} reviews
              </dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <h2>Reviews</h2>
          <div className="list-stack">
            {person.reviews.map((review) => (
              <article className="list-item" key={review.id}>
                <div>
                  <strong>
                    {review.author} · {review.rating}/5
                  </strong>
                  <p className="muted">{review.comment}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LocationMap
        query={`${person.suburb}, ${person.city}, Zimbabwe`}
        title={`${person.fullName} service area`}
      />
    </div>
  )
}
