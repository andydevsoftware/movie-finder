"use client";

import { useMovieStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AdvancedFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useMovieStore();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "Inglés" },
    { code: "fr", name: "Francés" },
    { code: "de", name: "Alemán" },
    { code: "it", name: "Italiano" },
    { code: "ja", name: "Japonés" },
    { code: "ko", name: "Coreano" },
    { code: "zh", name: "Chino" },
  ];

  const ratings = [
    { value: 0, label: "Todas" },
    { value: 5, label: "5+ ⭐" },
    { value: 6, label: "6+ ⭐" },
    { value: 7, label: "7+ ⭐" },
    { value: 8, label: "8+ ⭐" },
    { value: 9, label: "9+ ⭐" },
  ];

  const hasActiveFilters =
    filters.year || filters.rating > 0 || filters.language;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          hasActiveFilters
            ? "bg-[#E50914] text-white"
            : "bg-white/10 text-gray-300 hover:bg-white/20"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-full right-0 mt-2 w-80 bg-[#181818] rounded-lg shadow-2xl border border-white/10 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filtros</h3>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setIsOpen(false);
                    }}
                    className="text-sm text-[#E50914] hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Año
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ year: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  >
                    <option value="">Todos los años</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Calificación mínima
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ratings.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => setFilters({ rating: rating.value })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.rating === rating.value
                            ? "bg-[#E50914] text-white"
                            : "bg-black/50 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idioma original
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ language: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  >
                    <option value="">Todos los idiomas</option>
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-[#E50914] hover:bg-[#f6121d] text-white rounded-lg transition-colors font-medium"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
