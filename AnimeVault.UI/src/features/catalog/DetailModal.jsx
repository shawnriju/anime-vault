import { useState } from "react";
import { FormModal } from "../../components/common/Modal";
import { StatusBadge, MediaTypeBadge } from "../../components/common/Badge";
import { deleteAnimeItem } from "../../services/animeService";
import { toast } from "react-hot-toast";

export function DetailModal({ item, token, onClose, onEdit, onDeleted }) {
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
    const toastId = toast.loading("Deleting entry...");
    try {
      await deleteAnimeItem(item.id, token);
      toast.success("Entry deleted!", { id: toastId });
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to delete", { id: toastId });
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
