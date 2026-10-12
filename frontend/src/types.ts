export type ListingKind = 'person' | 'team'
export type AvatarTone = 'lavender' | 'peach' | 'blue' | 'mint' | 'yellow'
export type Format = 'Онлайн' | 'Очно' | 'Гибрид'
export type DiscoverView = 'people' | 'teams'
export type SortOption = 'newest' | 'experience' | 'name'

export type Listing = {
  id: number
  kind: ListingKind
  name: string
  initials: string
  avatar: AvatarTone
  role: string
  university: string
  course: string
  experience: number
  description: string
  skills: string[]
  format: Format
  badge: string
  badgeKind: ListingKind
  age: number
  project?: string
}

export type ToastMessage = {
  id: number
  title: string
  message: string
}

export type FiltersState = {
  search: string
  stack: string
  university: string
  format: string
  sort: SortOption
}
