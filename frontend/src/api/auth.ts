const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const TOKEN_KEY = 'dream-team.accessToken'
const NAME_KEY = 'dream-team.displayName'

export type AuthUser = {
  id: string
  email: string
  full_name: string
}

export class AuthApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredDisplayName(): string | null {
  return window.localStorage.getItem(NAME_KEY)
}

export function saveSession(token: string, name: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(NAME_KEY, name)
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(NAME_KEY)
}

async function readError(response: Response): Promise<string> {
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (response.status === 409) return 'Этот email уже занят. Войди или укажи другой.'
  if (response.status === 401) return 'Неверный email или пароль.'
  if (response.status === 422) {
    const detail = (payload as { detail?: unknown }).detail
    const text = JSON.stringify(detail ?? '')
    if (text.includes('password')) return 'Пароль должен быть не короче 8 символов.'
    if (text.includes('email')) return 'Укажи обычный email, например name@mail.ru.'
    if (text.includes('full_name')) return 'Напиши, как тебя зовут.'
    return 'Проверь поля: имя, email и пароль от 8 символов.'
  }
  if (!response.ok && response.status >= 500) return 'Сервер не смог обработать запрос. Попробуй ещё раз.'
  return 'Не удалось связаться с API. Проверь, что он запущен на порту 8000.'
}

export async function registerUser(input: {
  fullName: string
  email: string
  password: string
  githubUrl?: string
}): Promise<AuthUser> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: input.fullName,
        email: input.email,
        password: input.password,
        github_url: input.githubUrl || null,
      }),
    })
  } catch {
    throw new AuthApiError('Не удалось связаться с API. Проверь, что он запущен на порту 8000.', 0)
  }

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }
  return (await response.json()) as AuthUser
}

export async function loginUser(email: string, password: string): Promise<string> {
  const body = new URLSearchParams()
  body.set('username', email)
  body.set('password', password)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/users/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  } catch {
    throw new AuthApiError('Не удалось связаться с API. Проверь, что он запущен на порту 8000.', 0)
  }

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }
  const data = (await response.json()) as { access_token: string }
  return data.access_token
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new AuthApiError('Не удалось связаться с API. Проверь, что он запущен на порту 8000.', 0)
  }

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }
  return (await response.json()) as AuthUser
}
