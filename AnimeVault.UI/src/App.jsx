import { useState, useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import "./App.css";

const API_URL = "http://localhost:5286/api/anime";

const ANIME_STATUSES = [
  { value: "Unknown",   label: "Unknown" },
  { value: "Ongoing",   label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Hiatus",    label: "Hiatus" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Upcoming",  label: "Upcoming" },
];

const STATUS_CLASS = {
  Unknown:   "unknown",
  Ongoing:   "ongoing",
  Completed: "completed",
  Hiatus:    "hiatus",
  Cancelled: "cancelled",
  Upcoming:  "upcoming",
};

const EMPTY_FORM = {
  title: "",
  genre: "",
  description: "",
  releaseYear: "",
  status: "Unknown",
  coverImage: null,
};

function StatusBadge({ status }) {
  const label = status ?? "Unknown";
  const modifier = STATUS_CLASS[status] ?? "unknown";
  return (
    <span className={`status-badge status-badge--${modifier}`}>
      {label}
    </span>
  );
}

function AnimeCard({ anime }) {
  const thumbnailUrl = anime.coverImageUrl
    ? anime.coverImageUrl.replace("/covers/", "/thumbnails/")
    : null;
  
  function handleImageError(e) {
    // Thumbnail doesn't exist yet (If Lambda still processing)
    // Fall back to the original cover image
    if (e.target.src !== anime.coverImageUrl) {
      e.target.src = anime.coverImageUrl;
    }
  }

  return (
    <div className="anime-card">
      {thumbnailUrl && (
        <img
          className="anime-card__cover"
          src={thumbnailUrl}
          alt={`${anime.title} cover`}
          onError={handleImageError}
        />
      )}
      <div className="anime-card__body">
        <div className="anime-card__top">
          <span className="anime-card__title">{anime.title}</span>
          <StatusBadge status={anime.status} />
        </div>
        <span className="anime-card__genre">{anime.genre}</span>
        <span className="anime-card__year">{anime.releaseYear}</span>
        <p className="anime-card__description">{anime.description}</p>
      </div>
    </div>
  );
}

function AnimeForm({ onCreated, token }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // FormData instead of JSON — required for file uploads
      const formData = new FormData();
      formData.append("title",       form.title);
      formData.append("genre",       form.genre);
      formData.append("description", form.description);
      formData.append("releaseYear", form.releaseYear);
      formData.append("status",      form.status);
      if (form.coverImage) {
        formData.append("coverImage", form.coverImage);
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          // No Content-Type here — fetch sets it automatically for FormData
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(
        res.status === 401 ? "Unauthorised — token may have expired." : "Failed to create entry."
      );

      setForm(EMPTY_FORM);
      onCreated();
    } 
    catch (err) {
      setError(err.message);
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-panel">
      <p className="form-panel__title">New Entry</p>

      {error && <p className="error-msg">{error}</p>}

      <div className="form-grid">
        <input
          className="input form-grid--full"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <input
          className="input"
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
        />
        <input
          className="input"
          name="releaseYear"
          placeholder="Release Year"
          type="number"
          value={form.releaseYear}
          onChange={handleChange}
        />
        <select
          className="select"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          {ANIME_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          className="input"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <div className="form-grid--full">
          <label className="file-label">
            Cover Image (optional)
            <input
              className="file-input"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, coverImage: e.target.files[0] }))
              }
            />
          </label>
        </div>

        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add to Vault"}
        </button>
      </div>
    </div>
  );
}

function CatalogList({ animes }) {
  return (
    <section>
      <div className="catalog-header">
        <span className="catalog-header__title">Catalog</span>
        <span className="catalog-header__count">{animes.length} titles</span>
      </div>

      {animes.length === 0 ? (
        <p className="catalog-empty">No entries yet. Add one above.</p>
      ) : (
        <div className="catalog-list">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="header__title">Anime<span>Vault</span></h1>
        <p className="login-card__sub">Your personal anime catalog</p>
        <button className="btn-submit" onClick={onLogin}>
          Sign in to continue
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { token, login, logout, loading } = useAuth();
  const [animes, setAnimes] = useState([]);

  async function fetchAnimes() {
    try {
      const res = await fetch(API_URL, 
        {headers: { "Authorization": `Bearer ${token}` }}
      );
      const data = await res.json();
      setAnimes(data);
    } catch(err) {
      console.error("Could not reach the API.", err);
    }
  }

  useEffect(() => {
    if(token) fetchAnimes();
  }, [token]); // re-fetches whenever the token changes (i.e. on login)

  // Don't flash the login screen while we're checking localStorage for an existing session
  if (loading) return null;

  if (!token) return <LoginScreen onLogin={login} />;

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Anime<span>Vault</span></h1>
        <p className="header__subtitle">Personal Anime Catalog</p>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </header>

      <AnimeForm onCreated={fetchAnimes} token={token} />
      <CatalogList animes={animes} />
    </div>
  );
}