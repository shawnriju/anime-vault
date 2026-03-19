import { memo } from "react";
import { StatusBadge, MediaTypeBadge } from "../../components/common/Badge";

export const ListCard = memo(function ListCard({ item, onSelect }) {
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
});
