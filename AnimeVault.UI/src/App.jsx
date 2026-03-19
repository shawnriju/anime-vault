import { lazy, Suspense } from "react";
import { useAuth } from "./auth/AuthContext";
import { useAnimeCatalog } from "./hooks/useAnimeCatalog";
import { FormModal } from "./components/common/Modal";
import { CatalogList } from "./features/catalog/CatalogList";
import { LoginScreen } from "./features/auth/LoginScreen";
import "./App.css";

// Bundle code splitting for larger components
const MediaForm = lazy(() => import("./features/catalog/MediaForm").then(module => ({ default: module.MediaForm })));

export default function App() {
  const { token, login, logout, loading: authLoading } = useAuth();
  const {
    items,
    isLoading,
    isError,
    modalOpen,
    editingItem,
    handleEdit,
    handleAddClick,
    handleModalClose,
    handleItemChanged,
  } = useAnimeCatalog(token);

  if (authLoading) return null;
  if (!token) return <LoginScreen onLogin={login} />;

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
        {isLoading ? (
          <div className="catalog-loading">
            <span className="loading-spinner">Loading collection...</span>
          </div>
        ) : isError ? (
          <div className="catalog-empty">
             <p className="error-msg">Failed to load Collection. Please try again later.</p>
          </div>
        ) : (
          <CatalogList
            items={items}
            token={token}
            onDeleted={handleItemChanged}
            onEdit={handleEdit}
          />
        )}
      </main>

      {/* Add/Edit Modal with Suspense for code splitting */}
      <FormModal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingItem ? "Edit Title" : "Add New Title"}
      >
        <Suspense fallback={<div className="modal-loading">Preparing form...</div>}>
          <MediaForm
            token={token}
            editingItem={editingItem}
            onCreated={handleItemChanged}
            onCancelled={handleModalClose}
          />
        </Suspense>
      </FormModal>
    </div>
  );
}