import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AuthApiError, fetchCurrentUser, loginUser, registerUser, saveSession } from '../api/auth'

type AuthMode = 'login' | 'register'

type AuthDialogProps = {
  mode: AuthMode | null
  onClose: () => void
  onSwitch: (mode: AuthMode) => void
  onSuccess: (name: string, kind: AuthMode) => void
}

export function AuthDialog({ mode, onClose, onSwitch, onSuccess }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isRegister = mode === 'register'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (mode) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
      setError(null)
      setPending(false)
    } else if (dialog.open) {
      dialog.close()
    }
  }, [mode])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const unlock = () => {
      document.body.style.overflow = ''
    }
    dialog.addEventListener('close', unlock)
    return () => dialog.removeEventListener('close', unlock)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const fullName = String(data.get('fullName') ?? '').trim()
    const githubUrl = String(data.get('githubUrl') ?? '').trim()

    if (!email || !password) return
    if (isRegister && !fullName) return

    setError(null)
    setPending(true)
    try {
      if (isRegister) {
        const user = await registerUser({ fullName, email, password, githubUrl })
        const token = await loginUser(email, password)
        saveSession(token, user.full_name)
        form.reset()
        onSuccess(user.full_name, 'register')
      } else {
        const token = await loginUser(email, password)
        const me = await fetchCurrentUser(token)
        saveSession(token, me.full_name)
        form.reset()
        onSuccess(me.full_name, 'login')
      }
    } catch (caught) {
      const message =
        caught instanceof AuthApiError
          ? caught.message
          : 'Не получилось отправить форму. Попробуй ещё раз.'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <dialog
      className="stack-dialog auth-dialog"
      ref={dialogRef}
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close()
      }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="stack-head">
          <h2 id="auth-title">{isRegister ? 'Регистрация' : 'Вход'}</h2>
          <button className="close-modal" type="button" aria-label="Закрыть" onClick={() => dialogRef.current?.close()}>
            ×
          </button>
        </div>
        <p className="auth-note">
          {isRegister
            ? 'Имя попадёт в анкету, email станет логином. Пароль — не короче 8 символов.'
            : 'Войди тем email, который указывал при регистрации.'}
        </p>
        {isRegister ? (
          <label className="form-field">
            Как тебя зовут
            <input name="fullName" autoComplete="name" required maxLength={150} placeholder="Маша Ким" />
          </label>
        ) : null}
        <label className="form-field">
          Email
          <input name="email" type="email" autoComplete="email" required placeholder="name@mail.ru" />
        </label>
        <label className="form-field">
          Пароль
          <input
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={isRegister ? 8 : 1}
            placeholder={isRegister ? 'Не меньше 8 символов' : 'Пароль'}
          />
        </label>
        {isRegister ? (
          <label className="form-field">
            GitHub
            <input
              name="githubUrl"
              type="text"
              inputMode="url"
              autoComplete="url"
              maxLength={255}
              placeholder="https://github.com/username"
            />
          </label>
        ) : null}
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="cta auth-submit" type="submit" disabled={pending}>
          {pending
            ? isRegister
              ? 'Создаём аккаунт…'
              : 'Входим…'
            : isRegister
              ? 'Зарегистрироваться'
              : 'Войти'}
        </button>
        <button
          className="auth-switch"
          type="button"
          disabled={pending}
          onClick={() => onSwitch(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </dialog>
  )
}
