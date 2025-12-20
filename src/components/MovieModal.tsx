"use client";

import { Movie, Video } from "@/types/movie";
import { IMAGE_BASE_URL } from "@/lib/tmdb";
import { useEffect, useState } from "react";
import { useMovieStore } from "@/lib/store";
import { getMovieDetails, getMovieVideos, getSimilarMovies } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyboardNavigation } from "@/hooks/UseKeyboardNavigation";
import LazyImage from "./LazyImage";

interface MovieModalProps {
  movieId: number;
  onClose: () => void;
  isTheaterMode?: boolean;
  onFavoriteChange?: () => void;
}

export default function MovieModal({
  movieId,
  onClose,
  isTheaterMode = false,
  onFavoriteChange,
}: MovieModalProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const { isFavorite, toggleFavorite, addToHistory } = useMovieStore();
  const favorite = movie ? isFavorite(movie.id) : false;

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: !showTrailer,
  });

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        const [movieData, videosData, similarData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieVideos(movieId),
          getSimilarMovies(movieId, 1),
        ]);

        setMovie(movieData);
        addToHistory(movieData);

        // Filter for trailers
        const trailers = videosData.results.filter(
          (
            v: Video // ✅ Tipado explícitamente
          ) =>
            v.site === "YouTube" &&
            (v.type === "Trailer" || v.type === "Teaser")
        );
        setVideos(trailers);
        setSimilarMovies(similarData.results.slice(0, 12));
      } catch (error) {
        console.error("Error loading movie:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [movieId, addToHistory]);

  const handleFavoriteClick = () => {
    if (!movie) return;
    toggleFavorite(movie);
    onFavoriteChange?.();
  };

  useEffect(() => {
    if (!isTheaterMode) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isTheaterMode]);

  if (loading || !movie) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-t-2 border-b-2 border-[#E50914] rounded-full"
          />
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#E50914] opacity-20" />
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : `${IMAGE_BASE_URL}/w500${movie.poster_path}`;

  const mainTrailer = videos[0];

  const containerClass = isTheaterMode
    ? "min-h-screen bg-[#141414]"
    : "fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClass}
      onClick={!isTheaterMode ? onClose : undefined}
    >
      <div
        className={`${
          isTheaterMode
            ? "pt-24"
            : "min-h-screen px-3 sm:px-4 md:px-8 py-8 md:py-12 flex items-start justify-center pt-16 md:pt-20"
        }`}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative bg-[#181818] rounded-lg md:rounded-xl ${
            isTheaterMode ? "w-full" : "max-w-5xl w-full"
          } overflow-hidden shadow-2xl`}
          onClick={(e) => !isTheaterMode && e.stopPropagation()}
        >
          {/* Close Button */}
          {!isTheaterMode && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#181818] hover:bg-[#E50914] transition-all duration-300 group shadow-lg hover:scale-110"
              aria-label="Cerrar"
            >
              <svg
                className="w-6 h-6 text-white transition-transform group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Hero Section */}
          <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh]">
            {showTrailer && mainTrailer ? (
              <div className="absolute inset-0 bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1`}
                  title={mainTrailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-4 left-4 p-2 rounded-full bg-black/70 hover:bg-[#E50914] transition-all z-10"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <img
                  src={backdropUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/50 to-transparent" />

                {/* Title and Actions Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-2xl line-clamp-2"
                  >
                    {movie.title}
                  </motion.h2>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center gap-2 md:gap-3"
                  >
                    <button className="bg-white hover:bg-white/90 text-black font-semibold px-4 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base">
                      <svg
                        className="w-4 h-4 md:w-6 md:h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      <span>Reproducir</span>
                    </button>

                    {mainTrailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="bg-white hover:bg-white/90 text-black font-semibold px-4 py-2 md:px-8 md:py-3 rounded flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base"
                      >
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        <span>Ver Tráiler</span>
                      </button>
                    )}

                    <button
                      onClick={handleFavoriteClick}
                      className={`p-2 md:p-3 rounded-full border-2 transition-all duration-300 hover:scale-110 shadow-lg ${
                        favorite
                          ? "bg-[#E50914] border-[#E50914] hover:bg-[#f6121d]"
                          : "bg-[#2a2a2a]/90 border-gray-500 hover:border-white hover:bg-[#2a2a2a]"
                      }`}
                    >
                      {favorite ? (
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 md:w-6 md:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </button>
                  </motion.div>
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="p-4 sm:p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Left Column - Main Info */}
              <div className="flex-1 space-y-4 md:space-y-6">
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs sm:text-sm md:text-base">
                  <span className="text-[#46d369] font-semibold">
                    {Math.round(movie.vote_average * 10)}% coincidencia
                  </span>

                  {movie.release_date && (
                    <span className="text-gray-400">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}

                  {movie.runtime && (
                    <span className="px-2 py-0.5 border border-gray-600 text-gray-400 text-xs rounded">
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                    </span>
                  )}

                  <span className="px-2 py-0.5 border border-gray-600 text-gray-400 text-xs rounded">
                    HD
                  </span>
                </div>

                {/* Tagline */}
                {movie.tagline && (
                  <p className="text-gray-400 italic text-xs sm:text-sm md:text-base border-l-4 border-[#E50914] pl-3 md:pl-4">
                    "{movie.tagline}"
                  </p>
                )}

                {/* Overview */}
                <div>
                  <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                    {movie.overview || "No hay sinopsis disponible."}
                  </p>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="lg:w-1/3 space-y-3 md:space-y-4 text-xs sm:text-sm">
                {movie.genres && movie.genres.length > 0 && (
                  <div>
                    <span className="text-gray-500">Géneros: </span>
                    <span className="text-white">
                      {movie.genres.map((g) => g.name).join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Valoración: </span>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-[#E50914]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white font-semibold">
                      {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Genres Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 md:mt-8">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-[#2a2a2a] hover:bg-[#E50914] text-white rounded-full text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Similar Movies */}
            {similarMovies.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">
                  Películas similares
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {similarMovies.map((similar) => (
                    <div
                      key={similar.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedMovieId(similar.id)}
                    >
                      <LazyImage
                        src={
                          similar.poster_path
                            ? `${IMAGE_BASE_URL}/w500${similar.poster_path}`
                            : "/placeholder.png"
                        }
                        alt={similar.title}
                        className="rounded-md overflow-hidden hover:scale-105 transition-transform"
                      />
                      <h4 className="mt-2 text-xs md:text-sm text-white line-clamp-2">
                        {similar.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Nested modal for similar movies */}
      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onFavoriteChange={onFavoriteChange}
        />
      )}
    </motion.div>
  );
}
