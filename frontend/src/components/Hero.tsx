import { LayersIcon, UsersIcon } from './Icons'

type HeroProps = {
  onCreate: () => void
}

export function Hero({ onCreate }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Для тех, кто создаёт своё будущее
          </div>
          <h1 id="hero-title">
            Большие идеи
            <br />
            <span>Своя команда</span>
          </h1>
          <p className="hero-description">
            Найди людей, с которыми захочется провести бессонную ночь перед демо. Или
            присоединись к команде, которой не хватает именно тебя.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#discover">
              Найти свою команду <span aria-hidden="true">↗</span>
            </a>
            <button className="button button-ghost" type="button" onClick={onCreate}>
              <span aria-hidden="true">＋</span> Создать анкету
            </button>
          </div>
          <div className="hero-meta">
            <span className="hero-meta-item">
              <span className="icon">
                <UsersIcon />
              </span>
              Студенты и команды
            </span>
            <span className="hero-meta-item">
              <span className="icon">
                <LayersIcon />
              </span>
              Любой стек и опыт
            </span>
          </div>
        </div>
        <div className="hero-art" aria-label="Пример карточки команды">
          <div className="hero-orbit" aria-hidden="true" />
          <span className="spark spark-a" aria-hidden="true">
            ✳
          </span>
          <span className="spark spark-b" aria-hidden="true">
            ✦
          </span>
          <div className="team-preview">
            <div className="preview-top">
              <div>
                <div className="preview-label">Набор в команду</div>
                <div className="preview-title">CampusMind AI</div>
              </div>
              <div className="preview-count">3 из 4</div>
            </div>
            <div className="preview-avatars" aria-label="Три участника команды">
              <span className="avatar lavender">АК</span>
              <span className="avatar peach">МЛ</span>
              <span className="avatar blue">ИС</span>
              <span className="avatar more">+1</span>
            </div>
            <div className="preview-divider" />
            <div className="preview-bottom">
              <span>Ищут в команду</span>
              <strong>ML-инженера</strong>
            </div>
            <div className="preview-progress">
              <span />
            </div>
          </div>
          <div className="floating-tag float-a">
            <span className="tiny-check">✓</span> Совпадение по стеку
          </div>
          <div className="floating-tag float-b">
            <span className="tiny-check">✦</span> Идея найдена
          </div>
        </div>
      </div>
    </section>
  )
}
