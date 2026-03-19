import { API_URL } from "../constants/animeConstants";

export async function fetchAnimeItems(token) {
  const res = await fetch(API_URL, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not reach the API.");
  return await res.json();
}

export async function deleteAnimeItem(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete entry.");
}

export async function createOrUpdateAnimeItem(item, token, editingId = null) {
  const formData = new FormData();
  formData.append("title", item.title);
  formData.append("genre", item.genre);
  formData.append("mediaType", item.mediaType);
  formData.append("description", item.description);
  formData.append("notes", item.notes);
  formData.append("releaseYear", item.releaseYear || 0);
  formData.append("status", item.status);
  if (item.coverImage) formData.append("coverImage", item.coverImage);

  const isEditing = editingId !== null;
  const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Please sign in again.");
    throw new Error(isEditing ? "Failed to update entry." : "Failed to create entry.");
  }
}
