import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Movie } from "@/types/movie";

interface MovieStore {
  // Favorites
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (movie: Movie) => boolean;

  // History
  history: Movie[];
  addToHistory: (movie: Movie) => void;
  clearHistory: () => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // Filters
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  // Sort
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

export interface Filters {
  year: string;
  rating: number;
  language: string;
}

export type SortOption = "date_added" | "alphabetical" | "rating";

const defaultFilters: Filters = {
  year: "",
  rating: 0,
  language: "",
};

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (movie) => {
        const { favorites, addToast } = get();
        if (!favorites.some((fav) => fav.id === movie.id)) {
          set({
            favorites: [...favorites, { ...movie, dateAdded: Date.now() }],
          });
          addToast({
            type: "success",
            message: `"${movie.title}" añadida a tu lista`,
            duration: 3000,
          });
        }
      },
      removeFavorite: (movieId) => {
        const { favorites, addToast } = get();
        const movie = favorites.find((f) => f.id === movieId);
        set({ favorites: favorites.filter((fav) => fav.id !== movieId) });
        if (movie) {
          addToast({
            type: "info",
            message: `"${movie.title}" eliminada de tu lista`,
            duration: 3000,
          });
        }
      },
      isFavorite: (movieId) => {
        return get().favorites.some((fav) => fav.id === movieId);
      },
      toggleFavorite: (movie) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(movie.id)) {
          removeFavorite(movie.id);
          return false;
        } else {
          addFavorite(movie);
          return true;
        }
      },

      // History
      history: [],
      addToHistory: (movie) => {
        const { history } = get();
        const filtered = history.filter((m) => m.id !== movie.id);
        const newHistory = [movie, ...filtered].slice(0, 20); // Keep last 20
        set({ history: newHistory });
      },
      clearHistory: () => set({ history: [] }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after duration
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 3000);
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) => {
        set((state) => ({ filters: { ...state.filters, ...newFilters } }));
      },
      resetFilters: () => set({ filters: defaultFilters }),

      // Sort
      sortBy: "date_added",
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: "movieflix-storage",
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
        filters: state.filters,
        sortBy: state.sortBy,
      }),
    }
  )
);
