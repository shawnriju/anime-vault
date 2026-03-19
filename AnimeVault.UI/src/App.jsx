import { useState, useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5286"}/api/anime`;

// ── Data ──────────────────────────────────────────────────────
const MEDIA_TYPES = [
  { value: "Anime",       label: "Anime" },
  { value: "Movie",       label: "Movie" },
  { value: "TVShow",      label: "TV Show" },
  { value: "Documentary", label: "Documentary" },
  { value: "ShortFilm",   label: "Short Film" },
];

const STATUSES_BY_TYPE = {
  Anime:       ["Watching", "Completed", "On Hold", "Dropped", "Plan to Watch"],
  Movie:       ["Watched", "Plan to Watch", "Dropped"],
  TVShow:      ["Watching", "Completed", "On Hold", "Dropped", "Plan to Watch"],
  Documentary: ["Watched", "Plan to Watch"],
  ShortFilm:   ["Watched", "Plan to Watch"],
};

const STATUS_CLASS = {
  "Watching":      "watching",
  "Watched":       "watched",
  "Completed":     "completed",
  "On Hold":       "onhold",
  "Dropped":       "dropped",
  "Plan to Watch": "plantowatch",
};

const MEDIA_CLASS = {
  Anime:       "anime",
  Movie:       "movie",
  TVShow:      "tvshow",
  Documentary: "documentary",
  ShortFilm:   "shortfilm",
};

const EMPTY_FORM = {
  title:       "",
  genre:       "",
  mediaType:   "Movie",
  description: "",
  notes:       "",
  releaseYear: "",
  status:      "Plan to Watch",
  coverImage:  null,
};

// ── Badges ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const modifier = STATUS_CLASS[status] ?? "plantowatch";
  return (
    <span className={`status-badge status-badge--${modifier}`}>
      {status}
    </span>
  );
}

function MediaTypeBadge({ mediaType }) {
  const label    = MEDIA_TYPES.find((m) => m.value === mediaType)?.label ?? mediaType;
  const modifier = MEDIA_CLASS[mediaType] ?? "movie";
  return (
    <span className={`media-badge media-badge--${modifier}`}>
      {label}
    </span>
  );
}

// ── Search Icon SVG ───────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
      <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
      <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor"/>
    </svg>
  );
}

// ── Media Card ────────────────────────────────────────────────
function MediaCard({ item, onSelect }) {
  const thumbnailUrl = item.coverImageUrl
    ? item.coverImageUrl.replace("/covers/", "/thumbnails/")
    : null;

  function handleImageError(e) {
    if (e.target.src !== item.coverImageUrl) {
      e.target.src = item.coverImageUrl;
    }
  }

  return (
    <div className="media-card" onClick={() => onSelect(item)}>
      <div className="media-card__poster">
        {thumbnailUrl ? (
          <img
            className="media-card__img"
            src={thumbnailUrl}
            alt={`${item.title} cover`}
            onError={handleImageError}
          />
        ) : (
          <div className="media-card__no-image">
            <span className="media-card__no-image-letter">
              {item.title.charAt(0).toUpperCase()}
            </span>
            <span className="media-card__no-image-type">
              {MEDIA_TYPES.find((m) => m.value === item.mediaType)?.label ?? item.mediaType}
            </span>
          </div>
        )}
        <div className="media-card__overlay" />
        <div className="media-card__info">
          <p className="media-card__title">{item.title}</p>
          <div className="media-card__badges">
            <MediaTypeBadge mediaType={item.mediaType} />
          </div>
        </div>
        <div className="media-card__status-pin">
          <StatusBadge status={item.status} />
        </div>
      </div>
    </div>
  );
}

function ListCard({ item, onSelect }) {
  const thumbnailUrl = item.coverImageUrl
    ? item.coverImageUrl.replace("/covers/", "/thumbnails/")
    : null;

  function handleImageError(e) {
    if (e.target.src !== item.coverImageUrl) {
      e.target.src = item.coverImageUrl;
    }
  }

  return (
    <div className="list-card" onClick={() => onSelect(item)}>
      <div className="list-card__poster">
        {thumbnailUrl ? (
          <img
            className="list-card__img"
            src={thumbnailUrl}
            alt={`${item.title} cover`}
            onError={handleImageError}
          />
        ) : (
          <div className="list-card__no-image">
            <span className="list-card__no-image-letter">
              {item.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="list-card__body">
        <div className="list-card__header">
          <span className="list-card__title">{item.title}</span>
          <div className="list-card__badges">
            <MediaTypeBadge mediaType={item.mediaType} />
            <StatusBadge status={item.status} />
          </div>
        </div>
        <div className="list-card__meta">
          {item.genre && <span>{item.genre}</span>}
          {item.releaseYear > 0 && <span>{item.releaseYear}</span>}
        </div>
        {item.description && (
          <p className="list-card__description">{item.description}</p>
        )}
        {item.notes && (
          <div className="list-card__notes">
            <span className="list-card__notes-label">My Notes</span>
            <p className="list-card__notes-text">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailModal({ item, token, onClose, onEdit, onDeleted }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const thumbnailUrl = item.coverImageUrl
    ? item.coverImageUrl.replace("/covers/", "/thumbnails/")
    : null;

  function handleImageError(e) {
    if (e.target.src !== item.coverImageUrl) {
      e.target.src = item.coverImageUrl;
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/${item.id}`, {
        method:  "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete.");
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <FormModal open={true} onClose={onClose} title="Entry Details">
      <div className="detail-modal">
        {/* Cover + basic info side by side */}
        <div className="detail-modal__hero">
          <div className="detail-modal__poster">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${item.title} cover`}
                onError={handleImageError}
                className="detail-modal__img"
              />
            ) : (
              <div className="detail-modal__no-image">
                <span className="detail-modal__no-image-letter">
                  {item.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="detail-modal__meta">
            <h2 className="detail-modal__title">{item.title}</h2>
            <div className="detail-modal__badges">
              <MediaTypeBadge mediaType={item.mediaType} />
              <StatusBadge status={item.status} />
            </div>
            <div className="detail-modal__fields">
              {item.genre && (
                <div className="detail-modal__field">
                  <span className="detail-modal__field-label">Genre</span>
                  <span className="detail-modal__field-value">{item.genre}</span>
                </div>
              )}
              {item.releaseYear > 0 && (
                <div className="detail-modal__field">
                  <span className="detail-modal__field-label">Year</span>
                  <span className="detail-modal__field-value">{item.releaseYear}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="detail-modal__section">
            <span className="detail-modal__section-label">Description</span>
            <p className="detail-modal__section-text">{item.description}</p>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="detail-modal__section detail-modal__section--notes">
            <span className="detail-modal__section-label">My Notes</span>
            <p className="detail-modal__section-text">{item.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="detail-modal__actions">
          <button
            className="btn-submit"
            onClick={() => { onClose(); onEdit(item); }}
          >
            Edit Entry
          </button>

          {!confirmDelete ? (
            <button
              className="btn-delete-outline"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          ) : (
            <div className="delete-confirm">
              <span className="delete-confirm__text">Are you sure?</span>
              <button
                className="btn-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                className="btn-delete-cancel"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}

// ── Media Form (inside modal) ─────────────────────────────────
function MediaForm({ onCreated, onCancelled, token, editingItem = null }) {
  const isEditing = editingItem !== null;

  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title:       editingItem.title,
        genre:       editingItem.genre       ?? "",
        mediaType:   editingItem.mediaType   ?? "Movie",
        description: editingItem.description ?? "",
        notes:       editingItem.notes       ?? "",
        releaseYear: editingItem.releaseYear ?? "",
        status:      editingItem.status,
        coverImage:  null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [editingItem]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset status when media type changes
      if (name === "mediaType") {
        updated.status = STATUSES_BY_TYPE[value][0];
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title",       form.title);
      formData.append("genre",       form.genre);
      formData.append("mediaType",   form.mediaType);
      formData.append("description", form.description);
      formData.append("notes",       form.notes);
      formData.append("releaseYear", form.releaseYear || 0);
      formData.append("status",      form.status);
      if (form.coverImage) formData.append("coverImage", form.coverImage);

      const url    = isEditing ? `${API_URL}/${editingItem.id}` : API_URL;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(
        res.status === 401
          ? "Session expired. Please sign in again."
          : isEditing ? "Failed to update entry." : "Failed to create entry."
      );

      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const availableStatuses = STATUSES_BY_TYPE[form.mediaType] ?? [];

  return (
    <>
      {error && <p className="error-msg">{error}</p>}

      <div className="form-grid">
        <input
          className="input form-grid--full"
          name="title"
          placeholder="Title *"
          value={form.title}
          onChange={handleChange}
        />
        <select
          className="select"
          name="mediaType"
          value={form.mediaType}
          onChange={handleChange}
        >
          {MEDIA_TYPES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          className="select"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          {availableStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
        <input
          className="input form-grid--full"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <textarea
          className="input textarea form-grid--full"
          name="notes"
          placeholder="Personal notes (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={3}
        />
        <div className="form-grid--full">
          <label className="file-label">
            Cover Image (optional{isEditing ? " — leave empty to keep existing" : ""})
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
        <div className="form-actions form-grid--full">
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? isEditing ? "Saving..." : "Adding..."
              : isEditing ? "Save Changes" : "Add to WatchedList"}
          </button>
          {isEditing && (
            <button
              className="btn-cancel"
              onClick={onCancelled}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────
function FormModal({ open, onClose, children, title }) {
  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

// ── Catalog List ──────────────────────────────────────────────
function CatalogList({ items, token, onDeleted, onEdit }) {
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [view,         setView]         = useState("grid"); // "grid" | "list"
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType   = typeFilter === "All" || item.mediaType === typeFilter;
    return matchesSearch && matchesType;
  });

  function handleSelect(item) {
    setSelectedItem(item);
  }

  function handleDetailClose() {
    setSelectedItem(null);
  }

  function handleDetailEdit(item) {
    setSelectedItem(null);
    onEdit(item);
  }

  function handleDetailDeleted() {
    setSelectedItem(null);
    onDeleted();
  }

  return (
    <section>
      <div className="catalog-controls">
        <div className="catalog-controls__top">
          <div className="search-wrap">
            <span className="search-wrap__icon"><SearchIcon /></span>
            <input
              className="search-input"
              placeholder="Search your list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="type-filters">
          {["All", ...MEDIA_TYPES.map((m) => m.value)].map((type) => (
            <button
              key={type}
              className={`type-filter-btn ${typeFilter === type ? "type-filter-btn--active" : ""}`}
              onClick={() => setTypeFilter(type)}
            >
              {type === "TVShow" ? "TV Show" : type}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-header">
        <div className="catalog-header__left">
          <span className="catalog-header__title">Your List</span>
          <span className="catalog-header__count">
            {filtered.length} {filtered.length === 1 ? "title" : "titles"}
            {(typeFilter !== "All" || search) && items.length !== filtered.length
              ? ` of ${items.length}`
              : ""}
          </span>
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle__btn ${view === "grid" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            <GridIcon />
          </button>
          <button
            className={`view-toggle__btn ${view === "list" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setView("list")}
            title="List view"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {filtered.length === 0 && items.length > 0 ? (
        <div className="catalog-empty">
          <div className="catalog-empty__icon">🔍</div>
          <p className="catalog-empty__text">No results found</p>
          <p className="catalog-empty__sub">Try a different search or filter</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="catalog-empty">
          <div className="catalog-empty__icon">🎬</div>
          <p className="catalog-empty__text">Your list is empty</p>
          <p className="catalog-empty__sub">Add your first title using the button above</p>
        </div>
      ) : view === "grid" ? (
        <div className="catalog-grid">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-list-view">
          {filtered.map((item) => (
            <ListCard
              key={item.id}
              item={item}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          token={token}
          onClose={handleDetailClose}
          onEdit={handleDetailEdit}
          onDeleted={handleDetailDeleted}
        />
      )}
    </section>
  );
}

// ── Login Screen ──────────────────────────────────────────────
function LoginScreen({ onLogin }) {
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

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const { token, login, logout, loading } = useAuth();
  const [items, setItems]               = useState([]);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingItem, setEditingItem]   = useState(null);

  async function fetchItems() {
    try {
      const res  = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch {
      console.error("Could not reach the API.");
    }
  }

  function handleEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function handleAddClick() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingItem(null);
  }

  function handleCreated() {
    setModalOpen(false);
    setEditingItem(null);
    fetchItems();
  }

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  if (loading) return null;
  if (!token)  return <LoginScreen onLogin={login} />;

  return (
    <div className="app">
      {/* Sticky Navbar */}
      <nav className="navbar">
        <div className="navbar__brand">
          <div className="navbar__logo-mark">WL</div>
          <span className="navbar__title">
            WATCHED<span className="navbar__title--accent">LIST</span>
          </span>
        </div>
        <div className="navbar__right">
          <span className="navbar__count">
            <strong>{items.length}</strong> titles
          </span>
          {/* Add button in navbar */}
          <button className="btn-add" onClick={handleAddClick}>
            <span className="btn-add__icon">＋</span>
            Add Title
          </button>
          <button className="btn-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="main">
        <CatalogList
          items={items}
          token={token}
          onDeleted={fetchItems}
          onEdit={handleEdit}
        />
      </main>

      {/* Modal — used for both Add and Edit */}
      <FormModal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingItem ? "Edit Entry" : "New Entry"}
      >
        <MediaForm
          onCreated={handleCreated}
          onCancelled={handleModalClose}
          token={token}
          editingItem={editingItem}
        />
      </FormModal>
    </div>
  );
}