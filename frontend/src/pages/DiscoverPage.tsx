import { Filters } from '../components/Filters'
import { BuildingIcon, SearchIcon, UsersIcon } from '../components/Icons'
import { ListingCard } from '../components/ListingCard'
import type { DiscoverView, FiltersState, Listing, SortOption } from '../types'

type DiscoverPageProps = {
  view: DiscoverView
  filters: FiltersState
  listings: Listing[]
  savedIds: Set<number>
  onViewChange: (view: DiscoverView) => void
  onFiltersChange: (filters: FiltersState) => void
  onResetFilters: () => void
  onSave: (id: number) => void
  onContact: (item: Listing) => void
}

function pluralize(count: number, one: string, few: string, many: string) {
  const n10 = count % 10
  const n100 = count % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

export function DiscoverPage({
  view,
  filters,
  listings,
  savedIds,
  onViewChange,
  onFiltersChange,
  onResetFilters,
  onSave,
  onContact,
}: DiscoverPageProps) {
  const title =
    view === 'people' ? (
      <>
        Твоя следующая команда
        <br className="desktop-break" /> уже где-то здесь
      </>
    ) : (
      <>
        Команда мечты начинается
        <br className="desktop-break" /> с правильных людей
      </>
    )

  const noun =
    view === 'people'
      ? pluralize(listings.length, 'анкета', 'анкеты', 'анкет')
      : pluralize(listings.length, 'команда', 'команды', 'команд')

  return (
    <section id="discover" className="discover" aria-labelledby="discover-title">
      <div className="section-head">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Discovery
          </div>
          <h2 id="discover-title">{title}</h2>
          <p className="section-subtitle">Знакомься, объединяй идеи и собирай команду мечты.</p>
        </div>
        <div className="view-switch" role="tablist" aria-label="Что вы ищете">
          <button
            className={`view-tab${view === 'people' ? ' active' : ''}`}
            role="tab"
            aria-selected={view === 'people'}
            type="button"
            onClick={() => onViewChange('people')}
          >
            <span className="icon">
              <UsersIcon />
            </span>
            Ищу команду
          </button>
          <button
            className={`view-tab${view === 'teams' ? ' active' : ''}`}
            role="tab"
            aria-selected={view === 'teams'}
            type="button"
            onClick={() => onViewChange('teams')}
          >
            <span className="icon">
              <BuildingIcon />
            </span>
            Ищу людей
          </button>
        </div>
      </div>

      <Filters filters={filters} onChange={onFiltersChange} onReset={onResetFilters} />

      <div className="results-row">
        <div className="results-count" aria-live="polite">
          Найдено{' '}
          <strong>
            {listings.length} {noun}
          </strong>
        </div>
        <label className="sort-label">
          <span className="results-count">Сначала </span>
          <select
            className="sort-select"
            aria-label="Сортировка"
            value={filters.sort}
            onChange={(event) =>
              onFiltersChange({ ...filters, sort: event.target.value as SortOption })
            }
          >
            <option value="newest">новые</option>
            <option value="experience">с опытом</option>
            <option value="name">по имени</option>
          </select>
        </label>
      </div>

      <div className="listings-grid" aria-live="polite">
        {listings.length ? (
          listings.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              saved={savedIds.has(item.id)}
              onSave={onSave}
              onContact={onContact}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <SearchIcon />
            </div>
            <h3>Пока ничего не нашлось</h3>
            <p>Попробуй изменить фильтры или сбросить поиск.</p>
            <button className="button button-ghost" type="button" onClick={onResetFilters}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
