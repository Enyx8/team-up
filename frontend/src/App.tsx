import { useMemo, useState } from 'react'
import { CreateListingModal } from './components/CreateListingModal'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ToastRegion } from './components/ToastRegion'
import { TrustStrip } from './components/TrustStrip'
import { listings as demoListings } from './data/demoListings'
import { DiscoverPage } from './pages/DiscoverPage'
import type { DiscoverView, FiltersState, Listing, ListingKind, ToastMessage } from './types'

const emptyFilters: FiltersState = {
  search: '',
  stack: '',
  university: '',
  format: '',
  sort: 'newest',
}

function matchesListing(item: Listing, view: DiscoverView, filters: FiltersState) {
  const expectedKind = view === 'people' ? 'person' : 'team'
  if (item.kind !== expectedKind) return false
  if (filters.university && item.university !== filters.university) return false
  if (filters.format && item.format !== filters.format) return false
  if (
    filters.stack &&
    !item.skills.some((skill) => skill.toLowerCase().includes(filters.stack.toLowerCase()))
  ) {
    return false
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    const searchable = [
      item.name,
      item.role,
      item.project ?? '',
      item.university,
      item.course,
      item.description,
      ...item.skills,
    ]
      .join(' ')
      .toLowerCase()
    if (!searchable.includes(query)) return false
  }

  return true
}

function App() {
  const [view, setView] = useState<DiscoverView>('people')
  const [filters, setFilters] = useState<FiltersState>(emptyFilters)
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function showToast(title: string, message: string) {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, title, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }

  const visibleListings = useMemo(() => {
    const filtered = demoListings.filter((item) => matchesListing(item, view, filters))
    if (filters.sort === 'experience') {
      return [...filtered].sort((a, b) => b.experience - a.experience)
    }
    if (filters.sort === 'name') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }
    return [...filtered].sort((a, b) => a.age - b.age)
  }, [view, filters])

  function handleSave(id: number) {
    const alreadySaved = savedIds.has(id)
    setSavedIds((current) => {
      const next = new Set(current)
      if (alreadySaved) next.delete(id)
      else next.add(id)
      return next
    })
    showToast(
      alreadySaved ? 'Убрано из сохранённых' : 'Анкета сохранена',
      alreadySaved ? 'Эта анкета больше не в избранном.' : 'Можно вернуться к ней позже.',
    )
  }

  function handleContact(item: Listing) {
    showToast(
      'Знакомство начинается здесь',
      `В рабочей версии можно открыть профиль ${item.name} и написать сообщение.`,
    )
  }

  function handleCreateSubmit(payload: { name: string; role: string; kind: ListingKind }) {
    setModalOpen(false)
    showToast(
      'Анкета почти готова!',
      `${payload.name}, черновик «${payload.role}» подготовлен. В рабочей версии добавим публикацию и сохранение.`,
    )
  }

  return (
    <>
      <Header
        onLogin={() =>
          showToast('Вход в Dream-Team', 'В готовом проекте здесь подключается авторизация.')
        }
        onCreate={() => setModalOpen(true)}
      />

      <main id="top" className="container">
        <Hero onCreate={() => setModalOpen(true)} />
        <TrustStrip />
        <DiscoverPage
          view={view}
          filters={filters}
          listings={visibleListings}
          savedIds={savedIds}
          onViewChange={setView}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters(emptyFilters)}
          onSave={handleSave}
          onContact={handleContact}
        />
        <section className="bottom-cta" id="community">
          <div className="bottom-cta-copy">
            <h3>Команды не соберутся сами 👀</h3>
            <p>Расскажи, что умеешь и над чем хочешь работать.</p>
          </div>
          <button className="button button-dark" type="button" onClick={() => setModalOpen(true)}>
            Создать свою анкету <span aria-hidden="true">↗</span>
          </button>
        </section>
      </main>

      <Footer />
      <CreateListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
      <ToastRegion toasts={toasts} />
    </>
  )
}

export default App
