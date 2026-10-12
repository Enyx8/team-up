import type { Listing } from '../types'
import { ArrowIcon, BookmarkIcon, PinIcon } from './Icons'

type ListingCardProps = {
  item: Listing
  saved: boolean
  onSave: (id: number) => void
  onContact: (item: Listing) => void
}

export function ListingCard({ item, saved, onSave, onContact }: ListingCardProps) {
  const isTeam = item.kind === 'team'

  return (
    <article className="listing-card" aria-labelledby={`card-title-${item.id}`}>
      <div className="card-topline">
        <div className="person-block">
          <span className={`avatar ${item.avatar}`} aria-hidden="true">
            {item.initials}
          </span>
          <div className="person-info">
            <div className="person-name">{item.name}</div>
            <div className="person-meta">
              {item.university} · {item.course}
            </div>
          </div>
        </div>
        <button
          className={`save-button${saved ? ' saved' : ''}`}
          type="button"
          aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить анкету'}
          aria-pressed={saved}
          onClick={() => onSave(item.id)}
        >
          <BookmarkIcon />
        </button>
      </div>
      <div className={isTeam ? 'card-badge team' : 'card-badge'}>
        <span className="badge-dot" />
        {item.badge}
      </div>
      {isTeam && item.project ? (
        <div className="card-project">Проект · {item.project}</div>
      ) : null}
      <h3 className="card-title" id={`card-title-${item.id}`}>
        {item.role}
      </h3>
      <p className="card-description">{item.description}</p>
      <div className="card-tags">
        {item.skills.map((skill, index) => (
          <span className={`skill-tag${index === 0 ? ' accent' : ''}`} key={skill}>
            {skill}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <span className="format-meta">
          <span className="icon">
            <PinIcon />
          </span>
          {item.format}
        </span>
        <button className="card-link" type="button" onClick={() => onContact(item)}>
          Познакомиться{' '}
          <span className="icon">
            <ArrowIcon />
          </span>
        </button>
      </div>
    </article>
  )
}
