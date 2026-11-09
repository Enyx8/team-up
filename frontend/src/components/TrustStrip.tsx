import { CampusIcon, ClockIcon, StarIcon } from './Icons'

export function TrustStrip() {
  return (
    <section className="trust-strip" id="how-it-works" aria-label="Преимущества платформы">
      <span className="trust-caption">Всё для старта — в одном месте</span>
      <div className="trust-items">
        <span className="trust-item">
          <span className="icon">
            <StarIcon />
          </span>
          По интересам и стеку
        </span>
        <span className="trust-item">
          <span className="icon">
            <CampusIcon />
          </span>
          Из разных вузов
        </span>
        <span className="trust-item">
          <span className="icon">
            <ClockIcon />
          </span>
          Онлайн или очно
        </span>
      </div>
    </section>
  )
}
