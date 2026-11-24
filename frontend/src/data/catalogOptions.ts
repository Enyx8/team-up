/** Справочники для фильтров и формы создания (не каталог анкет). */

export const ROLE_OPTIONS = [
  { value: 'backend', label: 'Backend-разработчик' },
  { value: 'frontend', label: 'Frontend-разработчик' },
  { value: 'fullstack', label: 'Fullstack-разработчик' },
  { value: 'mobile', label: 'Mobile-разработчик' },
  { value: 'ml', label: 'ML-инженер' },
  { value: 'data', label: 'Data-инженер' },
  { value: 'devops', label: 'DevOps-инженер' },
  { value: 'qa', label: 'QA-инженер' },
  { value: 'design', label: 'UI/UX-дизайнер' },
  { value: 'pm', label: 'Product-менеджер' },
] as const

export type RoleFocus = (typeof ROLE_OPTIONS)[number]['value']

export const ROLE_LABELS: Record<RoleFocus, string> = Object.fromEntries(
  ROLE_OPTIONS.map((item) => [item.value, item.label]),
) as Record<RoleFocus, string>

export const CREATE_FORMAT_OPTIONS = ['Онлайн', 'Очно'] as const

export const STACK_GROUPS = [
  { title: 'Фронтенд', items: ['React', 'TypeScript', 'Flutter'] },
  { title: 'Бэкенд', items: ['Python', 'Node.js'] },
  { title: 'Базы данных', items: [] as string[], note: 'В текущих анкетах нет отдельного тега базы данных.' },
  { title: 'Аналитика', items: ['Machine Learning'] },
  { title: 'Дизайн', items: ['Figma', 'Product'] },
] as const

export const UNIVERSITY_OPTIONS = [
  'ВШЭ',
  'МГУ',
  'ИТМО',
  'МФТИ',
  'СПбГУ',
  'РТУ МИРЭА',
] as const

export const FORMAT_OPTIONS = ['Онлайн', 'Очно', 'Гибрид'] as const