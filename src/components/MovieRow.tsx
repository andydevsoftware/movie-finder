"use client";

import { useState, useEffect, useRef } from "react";
import { Movie } from "@/types/movie";
import { getMoviesByGenre } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import { motion } from "framer-motion";

interface MovieRowProps {
  genreId: number;
  title: string;
}

export default function MovieRow({ genreId, title }: MovieRowProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMovies();
  }, [genreId]);

  async function loadMovies() {
    try {
      setLoading(true);
      const data = await getMoviesByGenre(genreId, 1);
      // ✅ Limita a 10 películas por fila en lugar de todas
      setMovies(data.results.slice(0, 10));
    } catch (error) {
      console.error(`Error loading movies for genre ${genreId}:`, error);
    } finally {
      setLoading(false);
    }
  }
  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  const showLeftButton = scrollPosition > 0;
  const showRightButton = containerRef.current
    ? scrollPosition <
      containerRef.current.scrollWidth - containerRef.current.offsetWidth - 10
    : true;

  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="h-6 md:h-8 w-32 md:w-48 bg-gray-800 rounded animate-pulse mb-3 md:mb-4" />
        <div className="flex gap-2 md:gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 sm:w-36 md:w-44 aspect-[2/3] bg-gray-800 rounded animate-pulse"
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <>
      <div className="relative group/row">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 mb-3 md:mb-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl lg:text-2xl font-semibold text-white hover:text-[#E50914] transition-colors cursor-pointer"
          >
            {title}
          </motion.h2>
        </div>

        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Left Arrow */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showLeftButton ? 1 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-8 md:w-12 bg-gradient-to-r from-[#141414] to-transparent flex items-center justify-center transition-opacity duration-300"
            aria-label="Scroll left"
            style={{ pointerEvents: showLeftButton ? "auto" : "none" }}
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          {/* Movies Container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-32 sm:w-36 md:w-44 lg:w-48 xl:w-52"
              >
                <MovieCard
                  movie={movie}
                  onClick={() => setSelectedMovieId(movie.id)}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Right Arrow */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: showRightButton ? 1 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-8 md:w-12 bg-gradient-to-l from-[#141414] to-transparent flex items-center justify-center transition-opacity duration-300"
            aria-label="Scroll right"
            style={{ pointerEvents: showRightButton ? "auto" : "none" }}
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </>
  );
}
