"use client";
import Footer from "./Footer";
import { useState, useEffect, useMemo } from "react";
import { Movie } from "@/types/movie";
import { searchMovies } from "@/lib/tmdb";
import { useMovieStore } from "@/lib/store";
import MoviesGrid from "./MoviesGrid";
import MovieRow from "./MovieRow";
import SortDropdown from "./Sortdropdown";
import ToastContainer from "./ToastContainer";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "home" | "favorites" | "history";

const GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Terror" },
  { id: 878, name: "Ciencia Ficción" },
];

export default function MoviesApp() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // ✅ Scroll to top on page load/reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🔥 INPUT RÁPIDO
  const [inputValue, setInputValue] = useState("");

  // 🔥 QUERY REAL
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { favorites, history, sortBy, clearHistory } = useMovieStore();

  // ✅ debounce SOLO sincroniza
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(inputValue.trim());
    }, 400);

    return () => clearTimeout(t);
  }, [inputValue]);

  // 🔥 búsqueda real
  useEffect(() => {
    if (searchQuery.length < 3) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setIsSearching(true);
      setLoading(true);
      setPage(1);

      const data = await searchMovies(searchQuery, 1);
      if (cancelled) return;

      setSearchResults(data.results.slice(0, 20));
      setHasMore(data.page < data.total_pages);
      setLoading(false);
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);

    const data = await searchMovies(searchQuery, page + 1);
    setSearchResults((p) => [...p, ...data.results.slice(0, 20)]);
    setPage(page + 1);
    setHasMore(data.page < data.total_pages);
    setLoading(false);
  }

  const sortedFavorites = useMemo(() => {
    const arr = [...favorites];
    if (sortBy === "rating")
      return arr.sort((a, b) => b.vote_average - a.vote_average);
    if (sortBy === "alphabetical")
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [favorites, sortBy]);

  function changeTab(tab: TabType) {
    setActiveTab(tab);
    setInputValue("");
    setSearchQuery("");
    setIsSearching(false);
    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ Scroll suave al cambiar tab
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <ToastContainer />

      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <h1 className="text-3xl font-bold text-[#E50914]">MOVIEFLIX</h1>

          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => changeTab("home")}
              className="text-gray-300 hover:text-white"
            >
              Inicio
            </button>
            <button
              onClick={() => changeTab("favorites")}
              className="text-gray-300 hover:text-white"
            >
              Mi Lista
            </button>
            <button
              onClick={() => changeTab("history")}
              className="text-gray-300 hover:text-white"
            >
              Historial
            </button>
          </nav>

          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Buscar películas..."
            className="bg-black/70 px-4 py-2 rounded-md text-white w-64 focus:ring-2 focus:ring-white/30"
          />
        </div>
      </header>

      {isSearching ? (
        <main className="pt-28 px-6 pb-20">
          <MoviesGrid
            movies={searchResults}
            hasMore={hasMore}
            onLoadMore={loadMore}
            isLoading={loading}
          />
        </main>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="pt-28 space-y-12 pb-20"
          >
            {activeTab === "favorites" && (
              <div className="px-6">
                <h2 className="text-white text-2xl mb-4">Mi Lista</h2>
                <SortDropdown />
                <MoviesGrid movies={sortedFavorites} />
              </div>
            )}

            {activeTab === "history" && (
              <div className="px-6">
                <button
                  onClick={clearHistory}
                  className="text-gray-400 hover:text-white mb-4"
                >
                  Limpiar historial
                </button>
                <MoviesGrid movies={history} />
              </div>
            )}

            {activeTab === "home" &&
              GENRES.map((g) => (
                <MovieRow key={g.id} genreId={g.id} title={g.name} />
              ))}
          </motion.main>
        </AnimatePresence>
      )}
      <Footer />
    </div>
  );
}
