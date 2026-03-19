export const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5286"}/api/anime`;

export const MEDIA_TYPES = [
  { value: "Anime",       label: "Anime" },
  { value: "Movie",       label: "Movie" },
  { value: "TVShow",      label: "TV Show" },
  { value: "Documentary", label: "Documentary" },
  { value: "ShortFilm",   label: "Short Film" },
];

export const STATUSES_BY_TYPE = {
  Anime:       ["Watching", "Completed", "On Hold", "Dropped", "Plan to Watch"],
  Movie:       ["Watched", "Plan to Watch", "Dropped"],
  TVShow:      ["Watching", "Completed", "On Hold", "Dropped", "Plan to Watch"],
  Documentary: ["Watched", "Plan to Watch"],
  ShortFilm:   ["Watched", "Plan to Watch"],
};

export const STATUS_CLASS = {
  "Watching":      "watching",
  "Watched":       "watched",
  "Completed":     "completed",
  "On Hold":       "onhold",
  "Dropped":       "dropped",
  "Plan to Watch": "plantowatch",
};

export const MEDIA_CLASS = {
  Anime:       "anime",
  Movie:       "movie",
  TVShow:      "tvshow",
  Documentary: "documentary",
  ShortFilm:   "shortfilm",
};

export const EMPTY_FORM = {
  title:       "",
  genre:       "",
  mediaType:   "Movie",
  description: "",
  notes:       "",
  releaseYear: "",
  status:      "Plan to Watch",
  coverImage:  null,
};
