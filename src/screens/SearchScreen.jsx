import { useState, useRef } from 'react';
import Stars from '../components/ui/Stars.jsx';
import Badge from '../components/ui/Badge.jsx';
import { TYPE_LABELS, TYPE_COLORS, BROWSE_TILES, RECENT_SEARCHES } from '../utils/content.js';
import { FEED_DATA } from '../data/feed.js';
import { TRENDING_DATA } from '../data/trending.js';

const CORPUS = [
  ...FEED_DATA.map(i => ({ ...i, source: 'friends' })),
  ...TRENDING_DATA.map(i => ({ ...i, source: 'trending', status: 'watching', review: null, user: null })),
];

export default function SearchScreen({ active, onOpenModal, onToast, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef(null);

  function runSearch(q) {
    setSpinning(false);
    const lower = q.toLowerCase();
    const found = CORPUS.filter(i =>
      i.title.toLowerCase().includes(lower) ||
      (i.genre && i.genre.toLowerCase().includes(lower)) ||
      (i.user && i.user.toLowerCase().includes(lower)) ||
      (i.type && i.type.includes(lower))
    );
    setResults(found);
  }

  function handleInput(val) {
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults(null); setSpinning(false); return; }
    setSpinning(true);
    timerRef.current = setTimeout(() => runSearch(val.trim()), 350);
  }

  function doSearch(q) {
    setQuery(q);
    runSearch(q);
    onNavigate('search');
  }

  function clearSearch() {
    setQuery('');
    setResults(null);
    setSpinning(false);
  }

  const showBrowse = !query.trim() && results === null;

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-search">
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input
          id="search-input"
          placeholder="Search titles, genres, authors…"
          autoComplete="off"
          value={query}
          onChange={e => handleInput(e.target.value)}
        />
        {spinning && <span className="search-spinner">↻</span>}
        {query && !spinning && (
          <button className="search-clear" onClick={clearSearch}>✕</button>
        )}
      </div>

      {showBrowse && (
        <>
          <div className="recent-list">
            <div className="recent-label">RECENT SEARCHES</div>
            {RECENT_SEARCHES.map(s => (
              <div key={s} className="recent-item" onClick={() => doSearch(s)}>
                <span className="recent-icon">↺</span>
                <span className="recent-text">{s}</span>
              </div>
            ))}
          </div>
          <div className="browse-grid">
            {BROWSE_TILES.map(({ type, emoji, label, color }) => (
              <div
                key={type}
                className="browse-tile"
                style={{ borderColor: `${color}44` }}
                onClick={() => doSearch(type)}
              >
                <span className="browse-emoji">{emoji}</span>
                <span className="browse-label" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!showBrowse && results !== null && results.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🔍</span>
          <div className="empty-title" style={{ fontSize: 16 }}>Nothing found for "{query}"</div>
          <div className="empty-hint">Not in the catalogue yet</div>
          <button className="empty-btn" onClick={() => onOpenModal(query)}>+ LOG "{query}"</button>
        </div>
      )}

      {results && results.length > 0 && (
        <>
          {results.map(item => (
            <div key={item.id} className="result-row">
              <div className="result-img-fallback"><span style={{ fontSize: 22 }}>{item.poster}</span></div>
              <div className="result-info">
                <div className="result-title">{item.title}</div>
                <div className="result-meta">
                  <Badge label={TYPE_LABELS[item.type]} color={TYPE_COLORS[item.type]} />
                  {item.year && <span style={{ color: 'var(--dim)', fontSize: 10, fontFamily: 'var(--mono)' }}>{item.year}</span>}
                  <Stars rating={item.rating} size={10} />
                </div>
                {item.user && <span className="result-sub">Logged by {item.user}</span>}
              </div>
              <button className="result-log-btn" onClick={() => onOpenModal(item.title)}>+ LOG</button>
            </div>
          ))}
          <div className="pb-safe" />
        </>
      )}
    </div>
  );
}
