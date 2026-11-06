import { useMemo, useState } from 'react'
import { AuthDialog } from './components/AuthDialog'
import { CreateListingModal } from './components/CreateListingModal'
import { Header } from './components/Header'
import { ToastRegion } from './components/ToastRegion'
import { listings as demoListings } from './data/demoListings'
import { DiscoverPage } from './pages/DiscoverPage'
import type { DiscoverView, FiltersState, Listing, ListingKind, ToastMessage } from './types'

const emptyFilters: FiltersState = {
  search: '',
  stacks: [],
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
    filters.stacks.length &&
    !item.skills.some((skill) =>
      filters.stacks.some((selected) => skill.toLowerCase().includes(selected.toLowerCase())),
    )
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
  const [view, setView] = useState<DiscoverView>('teams')
  const [filters, setFilters] = useState<FiltersState>(emptyFilters)
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [loginName, setLoginName] = useState<string | null>(null)
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
    const action = item.kind === 'team' ? 'Откликнуться' : 'Позвать в команду'
    showToast(action, `В рабочей версии «${action}» откроет сообщение для ${item.name}.`)
  }

  function handleCreateSubmit(payload: { name: string; role: string; kind: ListingKind; stacks: string[] }) {
    setModalOpen(false)
    showToast(
      'Анкета почти готова!',
      `${payload.name}, черновик «${payload.role}» (${payload.stacks.join(', ')}) подготовлен. В рабочей версии добавим публикацию и сохранение.`,
    )
  }

  return (
    <>
      <Header
        view={view}
        login={loginName}
        onViewChange={setView}
        onLogin={() => setAuthMode('login')}
        onRegister={() => setAuthMode('register')}
        onLogout={() => setLoginName(null)}
        onCreate={() => setModalOpen(true)}
      />

      <main id="top">
        <DiscoverPage
          view={view}
          filters={filters}
          listings={visibleListings}
          savedIds={savedIds}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters(emptyFilters)}
          onSave={handleSave}
          onContact={handleContact}
        />
      </main>

      <AuthDialog
        mode={authMode}
        onClose={() => setAuthMode(null)}
        onSwitch={setAuthMode}
        onSuccess={(login) => {
          setLoginName(login)
          setAuthMode(null)
        }}
      />
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
