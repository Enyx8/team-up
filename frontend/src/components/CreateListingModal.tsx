import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FORMAT_OPTIONS, UNIVERSITY_OPTIONS } from '../data/demoListings'
import type { ListingKind } from '../types'

type CreateListingModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; role: string; kind: ListingKind }) => void
}

export function CreateListingModal({ open, onClose, onSubmit }: CreateListingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [kind, setKind] = useState<ListingKind>('person')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const role = String(data.get('role') ?? '').trim()
    onSubmit({ name, role, kind })
    form.reset()
    setKind('person')
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="modal-head">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Твой следующий шаг
          </div>
          <h2 id="modal-title">{kind === 'person' ? 'Ищу команду' : 'Ищем людей'}</h2>
          <p>Покажи, что умеешь, и найди единомышленников.</p>
        </div>
        <button className="close-modal" type="button" aria-label="Закрыть окно" onClick={onClose}>
          ✕
        </button>
      </div>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-mode" role="group" aria-label="Тип анкеты">
          <button
            type="button"
            className={kind === 'person' ? 'active' : ''}
            onClick={() => setKind('person')}
          >
            Ищу команду
          </button>
          <button
            type="button"
            className={kind === 'team' ? 'active' : ''}
            onClick={() => setKind('team')}
          >
            Ищу людей
          </button>
        </div>
        <div className="form-field">
          <label htmlFor="profile-name">Как тебя зовут?</label>
          <input id="profile-name" name="name" placeholder="Например, Аня Смирнова" required />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="profile-role">{kind === 'person' ? 'Твоя роль' : 'Кого ищете'}</label>
            <input
              id="profile-role"
              name="role"
              placeholder={kind === 'person' ? 'Frontend-разработчик' : 'ML-инженер'}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="profile-university">Вуз</label>
            <select id="profile-university" name="university" defaultValue="">
              <option value="">Выбрать вуз</option>
              {UNIVERSITY_OPTIONS.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
              <option value="Другой вуз">Другой вуз</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="profile-stack">Стек / навыки</label>
            <input id="profile-stack" name="stack" placeholder="React, TypeScript" required />
          </div>
          <div className="form-field">
            <label htmlFor="profile-format">Формат</label>
            <select id="profile-format" name="format" defaultValue={FORMAT_OPTIONS[0]}>
              {FORMAT_OPTIONS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="profile-about">Немного о себе / проекте</label>
          <textarea
            id="profile-about"
            name="about"
            placeholder="Что тебе интересно, какой опыт уже есть и кого ищешь..."
          />
        </div>
        <p className="form-help">
          Это демонстрационный прототип: данные не отправляются на сервер и не сохраняются после
          обновления страницы.
        </p>
        <button className="button button-purple" type="submit">
          Подготовить анкету <span aria-hidden="true">↗</span>
        </button>
      </form>
    </dialog>
  )
}
