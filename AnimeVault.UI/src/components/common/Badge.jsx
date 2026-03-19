import { MEDIA_TYPES, STATUS_CLASS, MEDIA_CLASS } from "../../constants/animeConstants";

export function StatusBadge({ status }) {
  const modifier = STATUS_CLASS[status] ?? "plantowatch";
  return (
    <span className={`status-badge status-badge--${modifier}`}>
      {status}
    </span>
  );
}

export function MediaTypeBadge({ mediaType }) {
  const label    = MEDIA_TYPES.find((m) => m.value === mediaType)?.label ?? mediaType;
  const modifier = MEDIA_CLASS[mediaType] ?? "movie";
  return (
    <span className={`media-badge media-badge--${modifier}`}>
      {label}
    </span>
  );
}
