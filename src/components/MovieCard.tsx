"use client";

import { Movie } from "@/types/movie";
import { IMAGE_BASE_URL } from "@/lib/tmdb";
import { useState, memo } from "react";
import { useMovieStore } from "@/lib/store";
import { motion } from "framer-motion";
import LazyImage from "./LazyImage";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  index?: number;
}

// ✅ Memo para evitar re-renders innecesarios
const MovieCard = memo(function MovieCard({
  movie,
  onClick,
  index = 0,
}: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useMovieStore();
  const [isHovered, setIsHovered] = useState(false);
  const favorite = isFavorite(movie.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(movie);
  };

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/w342${movie.poster_path}`
    : "/placeholder.png";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.03,
        duration: 0.2,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      data-grid-index={index}
      className="group relative overflow-visible rounded-md bg-zinc-900 cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:z-50 focus:scale-110 focus:z-50 focus:outline-none focus:ring-2 focus:ring-white/30"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Poster Image */}
      <LazyImage
        src={posterUrl}
        alt={movie.title}
        className="w-full"
        aspectRatio="2/3"
      />

      {/* Gradient Overlay — Netflix style (sin rojo) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />

      {/* Favorite Button */}
      <motion.button
        initial={false}
        animate={{
          scale: favorite ? 1 : isHovered ? 1 : 0.9,
          opacity: favorite ? 1 : isHovered ? 1 : 0,
        }}
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
          favorite
            ? "bg-[#E50914]/90 hover:bg-[#E50914]"
            : "bg-black/40 hover:bg-black/70"
        }`}
        aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <motion.svg
          animate={{ scale: favorite ? 1.1 : 1 }}
          className="w-5 h-5"
          fill={favorite ? "white" : "none"}
          stroke="white"
          strokeWidth={favorite ? 0 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
      </motion.button>

      {/* Info Overlay */}
      <motion.div
        initial={false}
        animate={{
          y: isHovered ? 0 : 8,
          opacity: isHovered ? 1 : 0,
        }}
        className="absolute bottom-0 left-0 right-0 p-3"
      >
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 drop-shadow-lg">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#E50914]/90 backdrop-blur-sm px-2 py-0.5 rounded">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white font-semibold">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>

          {movie.release_date && (
            <span className="text-gray-300 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
              {movie.release_date.split("-")[0]}
            </span>
          )}
        </div>

        <button
          onClick={onClick}
          className="mt-2 w-full bg-white/90 hover:bg-white text-black font-semibold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          <span className="text-xs">Ver más</span>
        </button>
      </motion.div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full group-focus:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
});

export default MovieCard;
