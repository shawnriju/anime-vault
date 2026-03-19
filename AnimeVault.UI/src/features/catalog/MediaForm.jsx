import { useState, useEffect } from "react";
import { EMPTY_FORM, MEDIA_TYPES, STATUSES_BY_TYPE } from "../../constants/animeConstants";
import { createOrUpdateAnimeItem } from "../../services/animeService";
import { toast } from "react-hot-toast";

export function MediaForm({ onCreated, onCancelled, token, editingItem = null }) {
  const isEditing = editingItem !== null;

  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

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
    
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isEditing ? "Updating entry..." : "Adding to collection...");

    try {
      await createOrUpdateAnimeItem(form, token, editingItem?.id);
      toast.success(isEditing ? "Entry updated!" : "Added to your collection!", { id: toastId });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      toast.error(err.message || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const availableStatuses = STATUSES_BY_TYPE[form.mediaType] ?? [];

  return (
    <div className="form-grid">
      <input
        className="input form-grid--full"
        name="title"
        placeholder="Title *"
        value={form.title}
        onChange={handleChange}
        required
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
  );
}
