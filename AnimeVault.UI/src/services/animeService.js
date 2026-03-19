import { secureFetch } from "./apiClient";
import { API_URL } from "../constants/animeConstants";

export async function fetchAnimeItems(token) {
  return await secureFetch("", token); // Root URL is /api/anime
}

export async function deleteAnimeItem(id, token) {
  return await secureFetch(`/${id}`, token, {
    method: "DELETE",
  });
}

export async function createOrUpdateAnimeItem(item, token, editingId = null) {
  const formData = new FormData();
  formData.append("title",       item.title.trim());
  formData.append("genre",       item.genre.trim());
  formData.append("mediaType",   item.mediaType);
  formData.append("description", item.description.trim());
  formData.append("notes",       item.notes.trim());
  formData.append("releaseYear", item.releaseYear || 0);
  formData.append("status",      item.status);
  
  if (item.coverImage) {
    formData.append("coverImage", item.coverImage);
  }

  const endpoint = editingId ? `/${editingId}` : "";
  const method   = editingId ? "PUT" : "POST";

  return await secureFetch(endpoint, token, {
    method,
    body: formData,
    // Note: Fetch handles boundaries for FormData if Content-Type header is omitted
  });
}
