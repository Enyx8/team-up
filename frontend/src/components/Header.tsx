import { BrandMark } from './Icons'

type HeaderProps = {
  onLogin: () => void
  onCreate: () => void
}

export function Header({ onLogin, onCreate }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <a className="brand" href="#top" aria-label="Dream-Team — на главную">
          <span className="brand-mark" aria-hidden="true">
            <BrandMark />
          </span>
          <span>
            dream<em>-team</em>
          </span>
        </a>
        <nav className="nav-links" aria-label="Главная навигация">
          <a href="#discover">Найти команду</a>
          <a href="#how-it-works">Как это работает</a>
          <a href="#community">Сообщество</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-login" type="button" onClick={onLogin}>
            Войти
          </button>
          <button className="button button-purple" type="button" onClick={onCreate}>
            Создать анкету <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </header>
  )
}
