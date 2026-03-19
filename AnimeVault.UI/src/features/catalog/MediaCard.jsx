import { memo } from "react";
import { MEDIA_TYPES } from "../../constants/animeConstants";
import { StatusBadge, MediaTypeBadge } from "../../components/common/Badge";

export const MediaCard = memo(function MediaCard({ item, onSelect }) {
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
});
