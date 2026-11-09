import { Filters } from '../components/Filters'
import { ListingCard } from '../components/ListingCard'
import type { DiscoverView, FiltersState, Listing } from '../types'

type DiscoverPageProps = {
  view: DiscoverView
  filters: FiltersState
  listings: Listing[]
  savedIds: Set<number>
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
  onFiltersChange,
  onResetFilters,
  onSave,
  onContact,
}: DiscoverPageProps) {
  const noun =
    view === 'people'
      ? pluralize(listings.length, 'человек', 'человека', 'человек')
      : pluralize(listings.length, 'команда', 'команды', 'команд')

  return (
    <section id="discover" className="discover">
      <Filters
        filters={filters}
        countLabel={`${listings.length} ${noun}`}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />
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
            <h3>По этим фильтрам никого нет</h3>
            <p>Сними стек или сбрось поиск.</p>
            <button className="cta" type="button" onClick={onResetFilters}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
