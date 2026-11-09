import type { DiscoverView } from '../types'

type HeaderProps = {
  view: DiscoverView
  login: string | null
  onViewChange: (view: DiscoverView) => void
  onLogin: () => void
  onRegister: () => void
  onLogout: () => void
  onCreate: () => void
}

export function Header({ view, login, onViewChange, onLogin, onRegister, onLogout, onCreate }: HeaderProps) {
  return (
    <header className="mast">
      <div className="mast-body">
        <div className="mast-title">
          <a className="wordmark" href="#discover" aria-label="team-up — к каталогу">
            <span className="wordmark-lead">team</span>
            <span className="wordmark-rule" aria-hidden="true" />
            <span className="wordmark-mark">up</span>
          </a>
          <div className="mast-actions">
            {login ? (
              <>
                <span className="account-name">{login}</span>
                <button className="account-register" type="button" onClick={onLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button className="account-login" type="button" onClick={onLogin}>
                  <span className="account-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <circle cx="8" cy="5.2" r="2.4" fill="currentColor" />
                      <path d="M3.2 13.2c.6-2.2 2.4-3.3 4.8-3.3s4.2 1.1 4.8 3.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  Войти
                </button>
                <button className="account-register" type="button" onClick={onRegister}>
                  Зарегистрироваться
                </button>
              </>
            )}
            <button className="cta" type="button" onClick={onCreate}>
              Создать анкету
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="mast-nav" aria-label="Кого искать">
          <button
            className="view-teams"
            type="button"
            aria-pressed={view === 'teams'}
            onClick={() => onViewChange('teams')}
          >
            Найти команду
          </button>
          <button
            className="view-people"
            type="button"
            aria-pressed={view === 'people'}
            onClick={() => onViewChange('people')}
          >
            Ищу людей
          </button>
        </nav>
      </div>
    </header>
  )
}
