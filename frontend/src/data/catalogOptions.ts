/** Справочники для фильтров и формы создания (не каталог анкет). */

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