import { useEffect, useRef } from 'react'
import { FORMAT_OPTIONS, STACK_GROUPS, UNIVERSITY_OPTIONS } from '../data/demoListings'
import type { FiltersState, SortOption } from '../types'
import { SearchIcon } from './Icons'

type FiltersProps = {
  filters: FiltersState
  countLabel: string
  onChange: (next: FiltersState) => void
  onReset: () => void
}

export function Filters({ filters, countLabel, onChange, onReset }: FiltersProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => {
      const opener = document.getElementById('open-stack')
      opener?.setAttribute('aria-expanded', 'false')
    }
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  function toggleStack(name: string) {
    const selected = filters.stacks.includes(name)
    onChange({
      ...filters,
      stacks: selected ? filters.stacks.filter((item) => item !== name) : [...filters.stacks, name],
    })
  }

  function openStack() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    document.getElementById('open-stack')?.setAttribute('aria-expanded', 'true')
    dialog.showModal()
  }

  const stackLabel = filters.stacks.length
    ? `Стек технологий · ${filters.stacks.length}`
    : 'Стек технологий'

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-top">
          <label className="search">
            <span className="icon">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Имя, роль, проект или вуз"
              aria-label="Поиск"
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
            />
          </label>
          <span className="count">{countLabel}</span>
          <select
            className="plain"
            aria-label="Сортировка"
            value={filters.sort}
            onChange={(event) => onChange({ ...filters, sort: event.target.value as SortOption })}
          >
            <option value="newest">Сначала новые</option>
            <option value="experience">Больше опыта</option>
            <option value="name">По имени</option>
          </select>
        </div>
        <div className="toolbar-bottom">
          <button
            className="stack-open"
            id="open-stack"
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            onClick={openStack}
          >
            <svg className="layers" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <path fill="currentColor" d="M14 4.2 4.5 9.2 14 14.2 23.5 9.2 14 4.2Z" />
              <path fill="currentColor" opacity="0.75" d="M4.5 13.2 14 18.2 23.5 13.2 21.2 12 14 15.8 6.8 12 4.5 13.2Z" />
              <path fill="currentColor" opacity="0.5" d="M4.5 17.4 14 22.4 23.5 17.4 21.2 16.2 14 20 6.8 16.2 4.5 17.4Z" />
            </svg>
            <span>{stackLabel}</span>
            <svg className="chev" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4.5 7 9 11.5 13.5 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <div className="seg" role="group" aria-label="Формат">
            <button
              type="button"
              aria-pressed={filters.format === ''}
              onClick={() => onChange({ ...filters, format: '' })}
            >
              Все
            </button>
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format}
                type="button"
                aria-pressed={filters.format === format}
                onClick={() => onChange({ ...filters, format })}
              >
                {format}
              </button>
            ))}
          </div>
          <select
            className="plain"
            aria-label="Вуз"
            value={filters.university}
            onChange={(event) => onChange({ ...filters, university: event.target.value })}
          >
            <option value="">Любой вуз</option>
            {UNIVERSITY_OPTIONS.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </select>
        </div>
      </div>

      <dialog
        className="stack-dialog"
        ref={dialogRef}
        aria-labelledby="stack-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close()
        }}
      >
        <div className="stack-panel">
          <div className="stack-head">
            <h2 id="stack-title">Стек технологий</h2>
            <button className="cta" type="button" onClick={() => dialogRef.current?.close()}>
              Готово
            </button>
          </div>
          {STACK_GROUPS.map((group) => (
            <section className="stack-group" key={group.title}>
              <h3>{group.title}</h3>
              {group.items.length ? (
                <div className="chips">
                  {group.items.map((name) => (
                    <button
                      key={name}
                      className="chip"
                      type="button"
                      aria-pressed={filters.stacks.includes(name)}
                      onClick={() => toggleStack(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <p>{'note' in group ? group.note : ''}</p>
              )}
            </section>
          ))}
          {filters.stacks.length ? (
            <button className="text-reset" type="button" onClick={onReset}>
              Сбросить выбор
            </button>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
