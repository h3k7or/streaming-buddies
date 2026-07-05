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

// Genre lists cached in module scope
let movieGenres = null;
let tvGenres = null;

async function getMovieGenres() {
  if (!movieGenres) {
    const data = await get('/genre/movie/list?language=en-US&');
    movieGenres = Object.fromEntries((data.genres || []).map(g => [g.id, g.name]));
  }
  return movieGenres;
}

async function getTVGenres() {
  if (!tvGenres) {
    const data = await get('/genre/tv/list?language=en-US&');
    tvGenres = Object.fromEntries((data.genres || []).map(g => [g.id, g.name]));
  }
  return tvGenres;
}

export async function searchMovies(query) {
  const [data, genres] = await Promise.all([
    get(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&`),
    getMovieGenres(),
  ]);
  return (data.results || []).map(r => ({
    tmdbId: r.id,
    title: r.title,
    year: r.release_date ? parseInt(r.release_date) : null,
    posterPath: r.poster_path,
    overview: r.overview,
    rating: r.vote_average ? Math.round(r.vote_average / 2) : null,
    genre: (r.genre_ids || []).slice(0, 2).map(id => genres[id]).filter(Boolean).join(', ') || null,
    type: 'movie',
  }));
}

export async function searchTV(query) {
  const [data, genres] = await Promise.all([
    get(`/search/tv?query=${encodeURIComponent(query)}&include_adult=false&`),
    getTVGenres(),
  ]);
  return (data.results || []).map(r => ({
    tmdbId: r.id,
    title: r.name,
    year: r.first_air_date ? parseInt(r.first_air_date) : null,
    posterPath: r.poster_path,
    overview: r.overview,
    rating: r.vote_average ? Math.round(r.vote_average / 2) : null,
    genre: (r.genre_ids || []).slice(0, 2).map(id => genres[id]).filter(Boolean).join(', ') || null,
    type: 'tv',
  }));
}
