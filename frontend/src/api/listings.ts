import { ROLE_LABELS, type RoleFocus } from '../data/catalogOptions'
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
  github_url: string | null
  author_github_url: string | null
}

export class ListingApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ListingApiError'
    this.status = status
  }
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

export function githubHref(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
}

function githubForListing(kind: ListingKind, item: ApiListing): string | null {
  const raw = kind === 'team' ? item.github_url : item.author_github_url
  const trimmed = raw?.trim()
  return trimmed ? trimmed : null
}

function badgeForListing(kind: ListingKind, slotsNeeded: number | null): string {
  if (kind === 'team' && slotsNeeded != null && slotsNeeded > 0) {
    return pluralParticipants(slotsNeeded)
  }
  return ''
}

export function mapApiListingToListing(item: ApiListing): Listing {
  const kind: ListingKind = item.type === 'seeking_team' ? 'person' : 'team'
  const role = item.role_focus ? ROLE_LABELS[item.role_focus as RoleFocus] : 'Участник'
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
    githubUrl: githubForListing(kind, item),
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

export type CreateListingInput = {
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

function formatToApi(format: Format): 'online' | 'offline' {
  return format === 'Очно' ? 'offline' : 'online'
}

export async function createListing(token: string, input: CreateListingInput): Promise<Listing> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: input.kind === 'person' ? 'seeking_team' : 'seeking_members',
        role_focus: input.role,
        bio: input.about || null,
        format: formatToApi(input.format),
        github_url: input.githubUrl || null,
        skills: input.stacks,
        slots_needed: input.kind === 'team' ? input.slotsNeeded : null,
        full_name: input.fullName,
        university: input.university || null,
      }),
    })
  } catch {
    throw new ListingApiError('Не удалось связаться с API. Проверь, что он запущен на порту 8000.', 0)
  }

  if (response.status === 401) {
    throw new ListingApiError('Сессия истекла. Войди снова, затем опубликуй анкету.', 401)
  }
  if (!response.ok) {
    let detail = `Сервер вернул ошибку ${response.status}`
    try {
      const payload = (await response.json()) as { detail?: unknown }
      if (typeof payload.detail === 'string') detail = payload.detail
    } catch {
      /* keep default */
    }
    throw new ListingApiError(detail, response.status)
  }

  const data = (await response.json()) as ApiListing
  return mapApiListingToListing(data)
}