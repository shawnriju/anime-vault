import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnimeItems, deleteAnimeItem } from "../services/animeService";
import { toast } from "react-hot-toast";

export function useAnimeCatalog(token) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const {
    data: items = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["anime", token],
    queryFn: () => fetchAnimeItems(token),
    enabled: !!token,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch anime items");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAnimeItem(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anime"] });
      toast.success("Entry deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete entry");
    }
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleItemChanged = () => {
    setModalOpen(false);
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ["anime"] });
  };

  return {
    items,
    isLoading,
    isError,
    error,
    modalOpen,
    editingItem,
    handleEdit,
    handleAddClick,
    handleModalClose,
    handleItemChanged,
    deleteItem: deleteMutation.mutate
  };
}
