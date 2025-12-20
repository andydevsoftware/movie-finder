import { Movie, MovieResponse, VideosResponse } from "@/types/movie";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export async function getPopularMovies(
  page: number = 1
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) throw new Error("Error al obtener películas populares");
  return response.json();
}

export async function getMovieDetails(id: number): Promise<Movie> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) throw new Error("Error al obtener detalles de la película");
  return response.json();
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
      query
    )}&page=${page}`,
    { next: { revalidate: 0 } }
  );

  if (!response.ok) throw new Error("Error al buscar películas");
  return response.json();
}

export async function getMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) throw new Error("Error al obtener películas por género");
  return response.json();
}

// 🎬 FUNCIÓN MEJORADA PARA OBTENER VIDEOS/TRAILERS
// Intenta primero en español, si no hay, busca en inglés
export async function getMovieVideos(id: number): Promise<VideosResponse> {
  try {
    // Primero intenta en español
    const responseES = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`,
      { next: { revalidate: 3600 } }
    );

    if (responseES.ok) {
      const dataES = await responseES.json();
      // Si encontró trailers en español, los devuelve
      if (dataES.results && dataES.results.length > 0) {
        return dataES;
      }
    }

    // Si no hay en español, busca en inglés
    const responseEN = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`,
      { next: { revalidate: 3600 } }
    );

    if (!responseEN.ok)
      throw new Error("Error al obtener videos de la película");
    return responseEN.json();
  } catch (error) {
    console.error("Error fetching videos:", error);
    return { id, results: [] };
  }
}

// 🎬 FUNCIÓN PARA OBTENER PELÍCULAS SIMILARES
export async function getSimilarMovies(
  id: number,
  page: number = 1
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=es-ES&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) throw new Error("Error al obtener películas similares");
  return response.json();
}

// FUNCIÓN PARA OBTENER PELÍCULAS CON FILTROS
export async function getMoviesWithFilters(
  page: number = 1,
  filters: {
    year?: string;
    rating?: number;
    language?: string;
    genreId?: number;
  }
): Promise<MovieResponse> {
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&page=${page}&sort_by=popularity.desc`;

  if (filters.year) {
    url += `&primary_release_year=${filters.year}`;
  }
  if (filters.rating && filters.rating > 0) {
    url += `&vote_average.gte=${filters.rating}`;
  }
  if (filters.language) {
    url += `&with_original_language=${filters.language}`;
  }
  if (filters.genreId) {
    url += `&with_genres=${filters.genreId}`;
  }

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) throw new Error("Error al obtener películas filtradas");
  return response.json();
}
