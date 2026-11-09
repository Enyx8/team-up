import { useEffect, useRef } from 'react'
import type { Listing } from '../types'
import { BookmarkIcon } from './Icons'

type ListingCardProps = {
  item: Listing
  saved: boolean
  onSave: (id: number) => void
  onContact: (item: Listing) => void
}

const PREVIEW_SKILLS = 3

export function ListingCard({ item, saved, onSave, onContact }: ListingCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isTeam = item.kind === 'team'
  const preview = item.skills.slice(0, PREVIEW_SKILLS)
  const hiddenSkills = item.skills.length - preview.length
  const actionLabel = isTeam ? 'Откликнуться' : 'Позвать в команду'
  const capTitle = isTeam ? item.project || item.role : item.name
  const capSub = isTeam ? `Ищут · ${item.role}` : item.role

  function openProfile() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    document.body.style.overflow = 'hidden'
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const unlock = () => {
      document.body.style.overflow = ''
    }
    dialog.addEventListener('close', unlock)
    return () => {
      dialog.removeEventListener('close', unlock)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      <article
        className={`listing-card ${isTeam ? 'team' : 'person'}`}
        aria-labelledby={`card-title-${item.id}`}
        onClick={openProfile}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openProfile()
          }
        }}
        tabIndex={0}
      >
        <header className="card-cap">
          <h3 className="card-cap-title" id={`card-title-${item.id}`}>
            {capTitle}
          </h3>
          <p className="card-cap-sub">{capSub}</p>
          <button
            className={`save-button${saved ? ' saved' : ''}`}
            type="button"
            aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить анкету'}
            aria-pressed={saved}
            onClick={(event) => {
              event.stopPropagation()
              onSave(item.id)
            }}
          >
            <BookmarkIcon />
          </button>
        </header>

        <div className="card-sheet">
          {isTeam ? <p className="card-lead">{item.name}</p> : null}
          <div className={isTeam ? 'card-meta' : 'card-meta card-lead'}>
            <span>
              {item.university} · {item.course}
            </span>
            <span className={`card-format${item.format === 'Онлайн' ? ' online' : ''}`}>
              <span className="format-dot" aria-hidden="true" />
              {item.format}
            </span>
          </div>

          <div className="card-tags">
            {preview.map((skill) => (
              <span className="skill-tag" key={skill}>
                {skill}
              </span>
            ))}
            {hiddenSkills > 0 ? <span className="skill-more">+{hiddenSkills}</span> : null}
          </div>

          <p className="card-description card-description-long">{item.description}</p>

          <div className="card-actions">
            <button
              className="card-link"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onContact(item)
              }}
            >
              {actionLabel}
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <p className="card-chin">{item.badge}</p>
      </article>

      <dialog
        className="stack-dialog profile-dialog"
        ref={dialogRef}
        aria-labelledby={`profile-title-${item.id}`}
        onClick={(event) => {
          event.stopPropagation()
          if (event.target === dialogRef.current) dialogRef.current?.close()
        }}
      >
        <div className="profile-sheet">
          <div className="profile-photo">
            <img src="/profile-placeholder.png" alt="" />
            <span className={`format-pill photo-pill${item.format === 'Онлайн' ? ' online' : ''}`}>
              <span className="format-dot" aria-hidden="true" />
              {item.format}
            </span>
            <button className="photo-close" type="button" aria-label="Закрыть анкету" onClick={() => dialogRef.current?.close()}>
              ×
            </button>
          </div>
          <div className="profile-body">
            <h2 id={`profile-title-${item.id}`}>{item.name}</h2>
            <p className="profile-line">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13.5V7.2L8 3l6 4.2v6.3H2Z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M6.2 13.5V9.2h3.6v4.3" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
              {item.university} · {item.course}
            </p>
            <p className="profile-line">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="4" width="12" height="9" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4V3.2A1.2 1.2 0 0 1 7.2 2h1.6A1.2 1.2 0 0 1 10 3.2V4" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
              {isTeam ? `Ищут · ${item.role}` : item.role}
            </p>
            {isTeam && item.project ? <p className="card-title">{item.project}</p> : null}
            <h3 className="profile-stack-title">Стек технологий</h3>
            <div className="card-tags">
              {item.skills.map((skill) => (
                <span className="skill-tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="profile-stack-title">О себе</h3>
            <p className="profile-text">{item.description}</p>
            <h3 className="profile-stack-title">Достижения</h3>
            <p className="achievement">пока нет, но скоро точно буду</p>
            {isTeam ? <p className="need-line">{item.badge}</p> : null}
            <div className="profile-actions">
              <button className="card-link profile-meet" type="button" onClick={() => onContact(item)}>
                {actionLabel}
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <button
                className={`save-button profile-save${saved ? ' saved' : ''}`}
                type="button"
                aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить анкету'}
                aria-pressed={saved}
                onClick={() => onSave(item.id)}
              >
                <BookmarkIcon />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
