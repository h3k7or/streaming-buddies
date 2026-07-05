import { useState, useRef } from 'react';
import { searchMovies, searchTV, posterUrl, POSTER_SM } from '../utils/tmdb.js';
import Stars from '../components/ui/Stars.jsx';
import Badge from '../components/ui/Badge.jsx';
import { TYPE_LABELS, TYPE_COLORS, RECENT_SEARCHES } from '../utils/content.js';

function PosterThumb({ posterPath }) {
  const [err, setErr] = useState(false);
  const src = posterPath ? posterUrl(posterPath, POSTER_SM) : null;
  if (src && !err) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="result-img-fallback">
      <span style={{ fontSize: 22 }}>{TYPE_LABELS.movie === 'Film' ? '🎬' : '📺'}</span>
    </div>
  );
}

export default function SearchScreen({ active, onOpenModal, onNavigate }) {
  const [mediaType, setMediaType] = useState('movie');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  async function runSearch(q, type) {
    setSpinning(false);
    setError(null);
    try {
      const data = type === 'movie' ? await searchMovies(q) : await searchTV(q);
      setResults(data);
    } catch (e) {
      setError('Search failed — check your API key.');
      setResults([]);
    }
  }

  function handleInput(val) {
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults(null); setSpinning(false); return; }
    setSpinning(true);
    timerRef.current = setTimeout(() => runSearch(val.trim(), mediaType), 400);
  }

  function handleTypeChange(type) {
    setMediaType(type);
    if (query.trim()) {
      setSpinning(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => runSearch(query.trim(), type), 400);
    }
  }

  function clearSearch() {
    setQuery('');
    setResults(null);
    setSpinning(false);
    setError(null);
  }

  function handleLog(item) {
    onOpenModal({
      title: item.title,
      type: item.type,
      year: item.year,
      posterPath: item.posterPath,
      genre: '',
    });
  }

  function doRecentSearch(q) {
    setQuery(q);
    setSpinning(true);
    timerRef.current = setTimeout(() => runSearch(q, mediaType), 400);
    onNavigate('search');
  }

  const showBrowse = !query.trim() && results === null;
  const typeColor = TYPE_COLORS[mediaType];

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-search">
      {/* Search bar */}
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input
          id="search-input"
          placeholder={`Search ${mediaType === 'movie' ? 'films' : 'series'}…`}
          autoComplete="off"
          value={query}
          onChange={e => handleInput(e.target.value)}
        />
        {spinning && <span className="search-spinner">↻</span>}
        {query && !spinning && (
          <button className="search-clear" onClick={clearSearch}>✕</button>
        )}
      </div>

      {/* Film / Series toggle — always visible */}
      <div className="filter-bar" style={{ borderBottom: `2px solid ${typeColor}44` }}>
        {['movie', 'tv'].map(t => (
          <button
            key={t}
            className={`filter-btn${mediaType === t ? ' active' : ''}`}
            style={mediaType === t ? { background: `${TYPE_COLORS[t]}18`, borderColor: `${TYPE_COLORS[t]}66`, color: TYPE_COLORS[t] } : {}}
            onClick={() => handleTypeChange(t)}
          >
            {t === 'movie' ? '🎬 FILMS' : '📺 SERIES'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Browse / recent searches */}
      {showBrowse && (
        <div className="recent-list">
          <div className="recent-label">RECENT SEARCHES</div>
          {RECENT_SEARCHES.map(s => (
            <div key={s} className="recent-item" onClick={() => doRecentSearch(s)}>
              <span className="recent-icon">↺</span>
              <span className="recent-text">{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty result */}
      {!showBrowse && results !== null && results.length === 0 && !error && (
        <div className="empty-state">
          <span className="empty-emoji">🔍</span>
          <div className="empty-title" style={{ fontSize: 16 }}>Nothing found for "{query}"</div>
          <div className="empty-hint">Not on TMDb, or try the other type</div>
          <button className="empty-btn" onClick={() => onOpenModal({ title: query, type: mediaType })}>
            + LOG "{query}"
          </button>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <>
          {results.map(item => (
            <div key={item.tmdbId} className="result-row">
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                  alt={item.title}
                  style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="result-img-fallback">
                  <span style={{ fontSize: 22 }}>{mediaType === 'movie' ? '🎬' : '📺'}</span>
                </div>
              )}
              <div className="result-info">
                <div className="result-title">{item.title}</div>
                <div className="result-meta">
                  <Badge label={TYPE_LABELS[item.type]} color={TYPE_COLORS[item.type]} />
                  {item.year && (
                    <span style={{ color: 'var(--dim)', fontSize: 10, fontFamily: 'var(--mono)' }}>{item.year}</span>
                  )}
                  {item.rating > 0 && <Stars rating={item.rating} size={10} />}
                </div>
                {item.overview && (
                  <div style={{ color: 'var(--dim)', fontSize: 10, fontFamily: 'var(--lora)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.overview}
                  </div>
                )}
              </div>
              <button className="result-log-btn" onClick={() => handleLog(item)}>+ LOG</button>
            </div>
          ))}
          <div className="pb-safe" />
        </>
      )}
    </div>
  );
}
