import {
  FORMAT_OPTIONS,
  STACK_OPTIONS,
  UNIVERSITY_OPTIONS,
} from '../data/demoListings'
import type { FiltersState } from '../types'
import { SearchIcon } from './Icons'

type FiltersProps = {
  filters: FiltersState
  onChange: (next: FiltersState) => void
  onReset: () => void
}

export function Filters({ filters, onChange, onReset }: FiltersProps) {
  return (
    <div className="filter-panel" role="search" aria-label="Фильтры анкет">
      <label className="search-field">
        <span className="icon">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Имя, роль, проект или технология..."
          aria-label="Поиск по имени, роли, проекту или технологии"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </label>
      <select
        className="filter-select"
        aria-label="Фильтр по стеку"
        value={filters.stack}
        onChange={(event) => onChange({ ...filters, stack: event.target.value })}
      >
        <option value="">Любой стек</option>
        {STACK_OPTIONS.map((stack) => (
          <option key={stack} value={stack}>
            {stack}
          </option>
        ))}
      </select>
      <select
        className="filter-select"
        aria-label="Фильтр по вузу"
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
      <select
        className="filter-select"
        aria-label="Фильтр по формату"
        value={filters.format}
        onChange={(event) => onChange({ ...filters, format: event.target.value })}
      >
        <option value="">Любой формат</option>
        {FORMAT_OPTIONS.map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
      <button className="clear-filters" type="button" onClick={onReset}>
        Сбросить
      </button>
    </div>
  )
}
