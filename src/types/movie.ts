export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  original_language?: string;
  dateAdded?: number; // Para ordenar favoritos
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// 🎬 TIPO PARA VIDEOS/TRAILERS
export interface Video {
  id: string;
  key: string; // Este es el ID de YouTube
  name: string; // Nombre del video
  site: string; // "YouTube"
  type: string; // "Trailer", "Teaser", etc.
  official: boolean; // Si es oficial
}

// 🎬 RESPUESTA DE LA API DE VIDEOS
export interface VideosResponse {
  id: number;
  results: Video[];
}
