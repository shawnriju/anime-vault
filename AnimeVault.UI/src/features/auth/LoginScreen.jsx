export function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card__logo-mark">WL</div>
        <h1 className="login-card__title">
           WATCHED<span className="navbar__title--accent">LIST</span>
        </h1>
        <p className="login-card__tagline">
          Your personal media vault
        </p>
        <div className="login-card__features">
          <div className="login-card__feature">
            <span className="login-card__feature-icon">🎬</span>
            <span className="login-card__feature-text">Movies</span>
          </div>
          <div className="login-card__feature">
            <span className="login-card__feature-icon">📺</span>
            <span className="login-card__feature-text">TV Shows</span>
          </div>
          <div className="login-card__feature">
            <span className="login-card__feature-icon">⛩️</span>
            <span className="login-card__feature-text">Anime</span>
          </div>
          <div className="login-card__feature">
            <span className="login-card__feature-icon">🎞️</span>
            <span className="login-card__feature-text">More</span>
          </div>
        </div>
        <button className="btn-login" onClick={onLogin}>
          Sign in to continue
        </button>
        <p className="login-card__footer">
          New here? You can sign up on the next screen.
        </p>
      </div>
    </div>
  );
}
