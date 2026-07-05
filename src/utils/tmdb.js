const BASE = 'https://api.themoviedb.org/3';
const KEY = import.meta.env.VITE_TMDB_API_KEY;

export const POSTER_SM = 'https://image.tmdb.org/t/p/w92';
export const POSTER_MD = 'https://image.tmdb.org/t/p/w342';

export function posterUrl(path, size = POSTER_SM) {
  return path ? `${size}${path}` : null;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}&api_key=${KEY}`);
  if (!res.ok) throw new Error(`TMDb ${res.status}`);
  return res.json();
}

export async function searchMovies(query) {
  const data = await get(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&`);
  return (data.results || []).map(r => ({
    tmdbId: r.id,
    title: r.title,
    year: r.release_date ? parseInt(r.release_date) : null,
    posterPath: r.poster_path,
    overview: r.overview,
    rating: r.vote_average ? Math.round(r.vote_average / 2) : null,
    type: 'movie',
  }));
}

export async function searchTV(query) {
  const data = await get(`/search/tv?query=${encodeURIComponent(query)}&include_adult=false&`);
  return (data.results || []).map(r => ({
    tmdbId: r.id,
    title: r.name,
    year: r.first_air_date ? parseInt(r.first_air_date) : null,
    posterPath: r.poster_path,
    overview: r.overview,
    rating: r.vote_average ? Math.round(r.vote_average / 2) : null,
    type: 'tv',
  }));
}
