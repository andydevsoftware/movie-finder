import { Movie } from "@/types/movie";

const FAVORITES_KEY = "tmdb_favorites";

export function getFavorites(): Movie[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(movie: Movie): void {
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.id === movie.id);

  if (!exists) {
    favorites.push(movie);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(movieId: number): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((fav) => fav.id !== movieId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorite(movieId: number): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === movieId);
}

export function toggleFavorite(movie: Movie): boolean {
  if (isFavorite(movie.id)) {
    removeFavorite(movie.id);
    return false;
  } else {
    addFavorite(movie);
    return true;
  }
}
