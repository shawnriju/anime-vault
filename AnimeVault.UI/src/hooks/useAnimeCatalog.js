import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnimeItems, deleteAnimeItem } from "../services/animeService";
import { toast } from "react-hot-toast";

const DUMMY_ITEMS = [
  {
    id: "demo-1",
    title: "Demon Slayer: Kimetsu no Yaiba",
    mediaType: "Anime",
    status: "Completed",
    genre: "Action, Fantasy",
    releaseYear: 2019,
    description: "A youth joins a secret society of demon slayers to avenge his family and save his cursed sister.",
    coverImageUrl: "https://image.api.playstation.com/vulcan/ap/rnd/202106/1704/JzL1NLQvok7Pghe9W5PP2XNV.png",
    notes: "Absolutely stunning animation by Ufotable. A must-watch!"
  },
  {
    id: "demo-2",
    title: "Inception",
    mediaType: "Movie",
    status: "Completed",
    genre: "Sci-Fi, Action",
    releaseYear: 2010,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/18/Inception_OST.jpg/250px-Inception_OST.jpg",
    notes: "One of the best mind-bending movies ever made."
  },
  {
    id: "demo-3",
    title: "The Witcher",
    mediaType: "TV Show",
    status: "Watching",
    genre: "Fantasy, Adventure",
    releaseYear: 2019,
    description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    coverImageUrl: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p17580215_b_v13_ab.jpg",
    notes: "Season 1 was great, currently catching up on Season 2."
  }
];

export function useAnimeCatalog(token, isDemo = false, onRestrictedAction) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const {
    data: itemsData = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["anime", token],
    queryFn: () => fetchAnimeItems(token),
    enabled: !!token && !isDemo,
    onError: (err) => {
      toast.error(err.message || "Failed to fetch anime items");
    }
  });

  const items = isDemo ? DUMMY_ITEMS : itemsData;

  const deleteMutation = useMutation({
    mutationFn: (id) => isDemo ? Promise.resolve() : deleteAnimeItem(id, token),
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["anime"] });
      }
      toast.success("Entry deleted successfully (Demo mode)");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete entry");
    }
  });

  const handleEdit = (item) => {
    if (isDemo) {
      onRestrictedAction();
      return;
    }
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    if (isDemo) {
      onRestrictedAction();
      return;
    }
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
    if (!isDemo) {
      queryClient.invalidateQueries({ queryKey: ["anime"] });
    } else {
      toast.success("Changes would be saved here!");
    }
  };

  return {
    items,
    isLoading: isDemo ? false : isLoading,
    isError: isDemo ? false : isError,
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
