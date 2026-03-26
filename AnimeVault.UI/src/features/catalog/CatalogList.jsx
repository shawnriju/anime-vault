import { useState, lazy, Suspense } from "react";
import { MEDIA_TYPES } from "../../constants/animeConstants";
import { SearchIcon, GridIcon, ListIcon } from "../../components/icons/Icons";
import { MediaCard } from "./MediaCard";
import { ListCard } from "./ListCard";

const DetailModal = lazy(() => import("./DetailModal").then(module => ({ default: module.DetailModal })));

export function CatalogList({ items, token, onDeleted, onEdit, isDemo, onRestrictedAction }) {
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

      {/* Detail modal with Suspense */}
      <Suspense fallback={null}>
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            token={token}
            onClose={handleDetailClose}
            onEdit={handleDetailEdit}
            onDeleted={handleDetailDeleted}
            isDemo={isDemo}
            onRestrictedAction={onRestrictedAction}
          />
        )}
      </Suspense>
    </section>
  );
}

