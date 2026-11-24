import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  CREATE_FORMAT_OPTIONS,
  ROLE_OPTIONS,
  STACK_GROUPS,
  UNIVERSITY_OPTIONS,
  type RoleFocus,
} from '../data/catalogOptions'
import type { Format, ListingKind } from '../types'

export type CreateListingPayload = {
  kind: ListingKind
  fullName: string
  role: RoleFocus
  university: string
  stacks: string[]
  format: Format
  githubUrl: string
  about: string
  slotsNeeded: number
}

type CreateListingModalProps = {
  open: boolean
  defaultName: string
  onClose: () => void
  onSubmit: (payload: CreateListingPayload) => Promise<void>
}

export function CreateListingModal({ open, defaultName, onClose, onSubmit }: CreateListingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [kind, setKind] = useState<ListingKind>('person')
  const [stacks, setStacks] = useState<string[]>([])
  const [stackError, setStackError] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const unlock = () => {
      document.body.style.overflow = ''
      setStacks([])
      setStackError('')
      setFormError('')
      setPending(false)
    }
    dialog.addEventListener('close', unlock)
    return () => dialog.removeEventListener('close', unlock)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const fullName = String(data.get('name') ?? '').trim()
    const role = String(data.get('role') ?? '').trim() as RoleFocus
    if (!stacks.length) {
      setStackError('Выбери хотя бы один навык.')
      return
    }
    if (!ROLE_OPTIONS.some((item) => item.value === role)) {
      setFormError('Выбери роль из списка.')
      return
    }

    setFormError('')
    setPending(true)
    try {
      await onSubmit({
        kind,
        fullName,
        role,
        university: String(data.get('university') ?? '').trim(),
        stacks,
        format: String(data.get('format') ?? 'Онлайн') as Format,
        githubUrl: String(data.get('githubUrl') ?? '').trim(),
        about: String(data.get('about') ?? '').trim(),
        slotsNeeded: Number(data.get('slotsNeeded') || 1),
      })
      form.reset()
      setKind('person')
      setStacks([])
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Не получилось опубликовать анкету.'
      setFormError(message)
    } finally {
      setPending(false)
    }
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
      <form className="create-form" onSubmit={handleSubmit} key={`${open}-${defaultName}`}>
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
          <input
            id="profile-name"
            name="name"
            placeholder="Например, Аня Смирнова"
            defaultValue={defaultName}
            required
            maxLength={150}
          />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="profile-role">{kind === 'person' ? 'Твоя роль' : 'Кого ищете'}</label>
            <select id="profile-role" name="role" required defaultValue="frontend">
              {ROLE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
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
            </select>
          </div>
        </div>
        {kind === 'team' ? (
          <div className="form-field">
            <label htmlFor="profile-slots">Сколько человек нужно</label>
            <input id="profile-slots" name="slotsNeeded" type="number" min={1} max={10} defaultValue={1} required />
          </div>
        ) : null}
        <div className="form-field">
          <span id="profile-stack">Стек</span>
          <div className="create-stacks" role="group" aria-labelledby="profile-stack">
            {STACK_GROUPS.map((group) => (
              <section className="stack-group" key={group.title}>
                <h3>{group.title}</h3>
                {group.items.length ? (
                  <div className="chips">
                    {group.items.map((name) => {
                      const selected = stacks.includes(name)
                      return (
                        <button
                          key={name}
                          className="chip"
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setStackError('')
                            setStacks((current) =>
                              selected ? current.filter((item) => item !== name) : [...current, name],
                            )
                          }}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p>{'note' in group ? group.note : ''}</p>
                )}
              </section>
            ))}
          </div>
          {stackError ? <p className="form-error">{stackError}</p> : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-format">Формат</label>
          <select id="profile-format" name="format" defaultValue={CREATE_FORMAT_OPTIONS[0]}>
            {CREATE_FORMAT_OPTIONS.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="profile-github">
            {kind === 'person' ? 'Твой GitHub' : 'Репозиторий проекта'}
          </label>
          <input
            id="profile-github"
            name="githubUrl"
            type="text"
            inputMode="url"
            maxLength={255}
            placeholder={
              kind === 'person'
                ? 'https://github.com/username'
                : 'https://github.com/org/hackathon — если репозиторий открытый'
            }
          />
        </div>
        <div className="form-field">
          <label htmlFor="profile-about">Немного о себе / проекте</label>
          <textarea
            id="profile-about"
            name="about"
            placeholder="Что тебе интересно, какой опыт уже есть и кого ищешь..."
          />
        </div>
        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : (
          <p className="form-help">Анкета сразу появится в каталоге. Нужен вход на сайт.</p>
        )}
        <button className="button button-purple" type="submit" disabled={pending}>
          {pending ? 'Публикуем…' : 'Опубликовать анкету'}
        </button>
      </form>
    </dialog>
  )
}
