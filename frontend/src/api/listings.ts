import type { Format, Listing, ListingKind } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export type ApiListing = {
  id: string
  author_id: string
  type: 'seeking_team' | 'seeking_members'
  role_focus:
    | 'backend'
    | 'frontend'
    | 'fullstack'
    | 'mobile'
    | 'ml'
    | 'data'
    | 'devops'
    | 'qa'
    | 'design'
    | 'pm'
    | null
  bio: string | null
  format: 'online' | 'offline'
  status: 'active' | 'closed'
  hackathons_count: number
  created_at: string
  name: string
  university: string | null
  course: number | null
  avatar_color: string | null
  skills: string[]
  slots_needed: number | null
}

const ROLE_LABELS: Record<NonNullable<ApiListing['role_focus']>, string> = {
  backend: 'Backend-разработчик',
  frontend: 'Frontend-разработчик',
  fullstack: 'Fullstack-разработчик',
  mobile: 'Mobile-разработчик',
  ml: 'ML-инженер',
  data: 'Data-инженер',
  devops: 'DevOps-инженер',
  qa: 'QA-инженер',
  design: 'UI/UX-дизайнер',
  pm: 'Product-менеджер',
}

function formatLabel(format: ApiListing['format']): Format {
  return format === 'online' ? 'Онлайн' : 'Очно'
}

function pluralParticipants(count: number): string {
  const n10 = count % 10
  const n100 = count % 100
  if (n10 === 1 && n100 !== 11) return `Нужен ${count} участник`
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `Нужно ${count} участника`
  return `Нужно ${count} участников`
}

function badgeForListing(kind: ListingKind, slotsNeeded: number | null): string {
  if (kind === 'team' && slotsNeeded != null && slotsNeeded > 0) {
    return pluralParticipants(slotsNeeded)
  }
  return ''
}

export function mapApiListingToListing(item: ApiListing): Listing {
  const kind: ListingKind = item.type === 'seeking_team' ? 'person' : 'team'
  const role = item.role_focus ? ROLE_LABELS[item.role_focus] : 'Участник'
  const course =
    item.course != null ? `${item.course} курс` : kind === 'team' ? 'Команда' : '—'

  return {
    id: item.id,
    kind,
    name: item.name,
    role,
    university: item.university ?? '—',
    course,
    experience: item.hackathons_count,
    description: item.bio ?? '',
    skills: item.skills,
    format: formatLabel(item.format),
    badge: badgeForListing(kind, item.slots_needed),
    createdAt: item.created_at,
  }
}

export async function fetchListings(signal?: AbortSignal): Promise<Listing[]> {
  const response = await fetch(`${API_BASE}/listings`, { signal })
  if (!response.ok) {
    throw new Error(`Сервер вернул ошибку ${response.status}`)
  }
  const data = (await response.json()) as ApiListing[]
  return data.map(mapApiListingToListing)
}