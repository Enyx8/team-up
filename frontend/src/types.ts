export type ListingKind = 'person' | 'team'
export type Format = 'Онлайн' | 'Очно' | 'Гибрид'
export type DiscoverView = 'people' | 'teams'
export type SortOption = 'newest' | 'experience' | 'name'

export type Listing = {
  id: string
  kind: ListingKind
  name: string
  role: string
  university: string
  course: string
  experience: number
  description: string
  skills: string[]
  format: Format
  badge: string
  createdAt: string
}

export type ToastMessage = {
  id: number
  title: string
  message: string
}

export type FiltersState = {
  search: string
  stacks: string[]
  university: string
  format: string
  sort: SortOption
}
