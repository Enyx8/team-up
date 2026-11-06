import { useEffect, useRef, type FormEvent } from 'react'

type AuthMode = 'login' | 'register'

type AuthDialogProps = {
  mode: AuthMode | null
  onClose: () => void
  onSwitch: (mode: AuthMode) => void
  onSuccess: (login: string) => void
}

export function AuthDialog({ mode, onClose, onSwitch, onSuccess }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isRegister = mode === 'register'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (mode) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const login = String(data.get('login') ?? '').trim()
    if (!login) return
    onSuccess(login)
    event.currentTarget.reset()
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
          Заглушка: пароль никуда не уходит. На сайте появится логин, который вы введёте.
        </p>
        <label className="form-field">
          Логин
          <input name="login" autoComplete="username" required placeholder="Например, masha" />
        </label>
        <label className="form-field">
          Пароль
          <input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required placeholder="Любой, пока не проверяется" />
        </label>
        <button className="cta auth-submit" type="submit">
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        <button
          className="auth-switch"
          type="button"
          onClick={() => onSwitch(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </dialog>
  )
}
