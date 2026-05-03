import zimbabweCoverageMap from '../assets/zimbabwe-coverage-map.svg'
import { coverageProvinces, coveredAreas, tradespeople } from '../data/mockData'

interface LocationMapProps {
  title: string
  query: string
}

export function LocationMap({ title, query }: LocationMapProps) {
  const normalizedQuery = query.trim().toLowerCase()
  const liveMapQuery = query.trim().length > 0 ? query : 'Zimbabwe'
  const fallbackLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(liveMapQuery)}`

  const matchingProvinces =
    normalizedQuery.length === 0
      ? coverageProvinces
      : coverageProvinces.filter(
          (province) =>
            province.province.toLowerCase().includes(normalizedQuery) ||
            province.city.toLowerCase().includes(normalizedQuery) ||
            province.areas.some((area) => area.toLowerCase().includes(normalizedQuery)),
        )

  const visibleProvinces = matchingProvinces.length > 0 ? matchingProvinces : coverageProvinces
  const visibleAreas = coveredAreas.filter((area) =>
    visibleProvinces.some((province) => province.province === area.province && province.city === area.city),
  )
  const visibleTradespeople = tradespeople.filter((person) =>
    visibleAreas.some((area) => area.area === person.suburb && area.city === person.city),
  )

  return (
    <div className="map-card">
      <div className="map-card-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            {visibleProvinces.length} provinces · {visibleAreas.length} covered areas ·{' '}
            {visibleTradespeople.length} tradespeople
          </p>
        </div>
        <a className="ghost-button" href={fallbackLink} rel="noreferrer" target="_blank">
          Open live map
        </a>
      </div>

      <div className="coverage-layout">
        <div className="coverage-image-shell">
          <img alt="Zimbabwe coverage map" className="coverage-image" src={zimbabweCoverageMap} />
          {visibleProvinces.map((province) => (
            <div
              className="coverage-marker"
              key={province.province}
              style={{ left: `${province.marker.left}%`, top: `${province.marker.top}%` }}
            >
              <span>{province.areas.length}</span>
              <strong>{province.province}</strong>
            </div>
          ))}
        </div>

        <div className="coverage-sidebar">
          {visibleProvinces.map((province) => (
            <article className="coverage-province" key={province.province}>
              <div className="coverage-province-header">
                <strong>{province.province}</strong>
                <span>{province.city}</span>
              </div>
              <div className="coverage-area-list">
                {province.areas.map((area) => (
                  <span className="pill" key={`${province.province}-${area}`}>
                    {area}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
