"use client";

import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";
import { useState, useMemo } from "react";
import MovieModal from "./MovieModal";
import { useInfiniteScroll } from "@/hooks/useinfinitescroll";

interface MoviesGridProps {
  movies: Movie[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export default function MoviesGrid({
  movies,
  hasMore = false,
  isLoading = false,
  onLoadMore,
}: MoviesGridProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: onLoadMore || (() => {}),
  });

  // 🔥 Detectar si estamos en modo búsqueda
  const isSearchMode = useMemo(() => movies.length > 20, [movies.length]);

  if (movies.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20">
        <svg
          className="w-16 h-16 mx-auto text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <p className="text-gray-400 text-lg">No se encontraron películas</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id} // 🔥 key correcta (MUY IMPORTANTE)
            movie={movie}
            onClick={() => setSelectedMovieId(movie.id)}
            index={isSearchMode ? undefined : index} // 🔥 sin animaciones en búsqueda
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]" />
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-[#E50914] opacity-20" />
          </div>
        </div>
      )}

      {/* Infinite scroll */}
      {hasMore && onLoadMore && (
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {!isLoading && (
            <p className="text-gray-500 text-sm">Cargando más películas...</p>
          )}
        </div>
      )}

      {/* Modal (fuera del grid para evitar renders) */}
      {selectedMovieId !== null && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </>
  );
}
