import { useState, useEffect, useRef } from 'react';
import { TYPE_LABELS, STATUS_OPTIONS } from '../../utils/content.js';
import { searchMovies, searchTV, POSTER_SM } from '../../utils/tmdb.js';
import { insertEntry } from '../../utils/api.js';

export default function LogModal({ open, prefill, modalType, modalStatus, modalRating, modalPosterPath, modalYear, user, dispatch }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [review, setReview] = useState('');
  const [words, setWords] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const titleRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(prefill || '');
      setGenre('');
      setSelectedItem(null);
      setResults([]);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, prefill]);

  // Search TMDb as user types
  useEffect(() => {
    if (!open) return;
    if (title.length < 2 || selectedItem) {
      setResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const fn = modalType === 'tv' ? searchTV : searchMovies;
        const res = await fn(title);
        setResults(res.slice(0, 5));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [title, modalType, open, selectedItem]);

  function selectResult(item) {
    setTitle(item.title);
    setGenre(item.genre || '');
    setSelectedItem(item);
    setResults([]);
    dispatch({ type: 'OPEN_MODAL', item });
  }

  function clearSelection() {
    setSelectedItem(null);
    setTitle('');
    setGenre('');
    dispatch({ type: 'CLOSE_MODAL' });
    dispatch({ type: 'OPEN_MODAL', prefill: '' });
    setTimeout(() => titleRef.current?.focus(), 50);
  }

  function enforceOneWord(val) {
    return val.replace(/\s+/g, '');
  }

  function handleClose(e) {
    if (e && e.target !== e.currentTarget) return;
    dispatch({ type: 'CLOSE_MODAL' });
    resetForm();
  }

  function resetForm() {
    setTitle('');
    setGenre('');
    setReview('');
    setWords(['', '', '']);
    setResults([]);
    setSelectedItem(null);
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    const entry = {
      type: modalType,
      title: title.trim(),
      year: modalYear || selectedItem?.year || new Date().getFullYear(),
      status: modalStatus,
      rating: modalRating,
      review: review.trim() || null,
      wordSummary: words.map(w => w.trim().toLowerCase()).filter(Boolean),
      genre: genre.trim() || null,
      posterPath: modalPosterPath || selectedItem?.posterPath || null,
      tmdbId: selectedItem?.tmdbId || null,
    };
    try {
      const saved = await insertEntry(entry, user.id);
      dispatch({ type: 'PREPEND_ENTRY', entry: saved });
      dispatch({ type: 'SHOW_TOAST', msg: `"${entry.title}" logged!` });
      dispatch({ type: 'SHOW_SCREEN', screen: 'feed' });
      resetForm();
    } catch (err) {
      console.error('submitLog failed:', err);
      dispatch({ type: 'SHOW_TOAST', msg: 'Failed to save — try again' });
    }
  }

  const wordCount = words.filter(w => w.trim()).length;

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={handleClose}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">◈ LOG ENTRY</span>
          <button className="modal-close" onClick={() => { dispatch({ type: 'CLOSE_MODAL' }); resetForm(); }}>✕</button>
        </div>
        <div className="modal-body">

          {/* TYPE — always first */}
          <div className="modal-label">TYPE</div>
          <div className="chip-row" style={{ marginBottom: 14 }}>
            {['movie', 'tv'].map(t => (
              <button
                key={t}
                className={`chip${modalType === t ? ' active' : ''}`}
                onClick={() => { dispatch({ type: 'SET_MODAL_TYPE', modalType: t }); setSelectedItem(null); setResults([]); }}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* TITLE with TMDb search */}
          <div className="modal-label">TITLE</div>
          {selectedItem && modalPosterPath ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, background: 'var(--card)', border: '1px solid var(--border)', padding: 10 }}>
              <img
                src={`${POSTER_SM}${modalPosterPath}`}
                alt=""
                style={{ width: 44, height: 62, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--text)', fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700 }}>{title}</div>
                {modalYear && <div style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 10, marginTop: 2 }}>{modalYear}</div>}
                {genre && <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, marginTop: 2 }}>{genre}</div>}
              </div>
              <button onClick={clearSelection} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                ref={titleRef}
                className="modal-text-input"
                placeholder={`Search for a ${modalType === 'tv' ? 'series' : 'film'}…`}
                value={title}
                onChange={e => { setTitle(e.target.value); setSelectedItem(null); }}
              />
              {searching && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)', padding: '4px 0', letterSpacing: 1 }}>SEARCHING…</div>
              )}
              {results.length > 0 && (
                <div style={{ border: '1px solid var(--border)', background: 'var(--card)', marginTop: 2 }}>
                  {results.map(item => (
                    <div
                      key={item.tmdbId}
                      onClick={() => selectResult(item)}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                    >
                      {item.posterPath
                        ? <img src={`${POSTER_SM}${item.posterPath}`} alt="" style={{ width: 28, height: 40, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 28, height: 40, background: 'var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{modalType === 'tv' ? '📺' : '🎬'}</div>
                      }
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'var(--text)', fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <div style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 10 }}>{item.year}{item.genre ? ` · ${item.genre}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GENRE — auto-filled, editable */}
          <div className="modal-label" style={{ marginTop: 10 }}>GENRE</div>
          <input
            className="modal-text-input"
            placeholder="e.g. Sci-Fi, Drama…"
            value={genre}
            onChange={e => setGenre(e.target.value)}
          />

          <div className="modal-label">STATUS</div>
          <div className="chip-row">
            {STATUS_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`chip${modalStatus === o.value ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_MODAL_STATUS', modalStatus: o.value })}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="modal-label">RATING</div>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className="star-btn"
                style={{ color: n <= modalRating ? '#C8A96E' : '#ddd' }}
                onClick={() => dispatch({ type: 'SET_MODAL_RATING', rating: n })}
              >
                ★
              </button>
            ))}
          </div>

          <div className="modal-label">REVIEW</div>
          <textarea
            className="modal-textarea"
            rows={4}
            placeholder="Write a short review…"
            value={review}
            onChange={e => setReview(e.target.value)}
          />

          <div className="modal-label" style={{ marginTop: 8 }}>
            3 WORD SUMMARY
            <span style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 9, marginLeft: 8, letterSpacing: 0 }}>optional</span>
          </div>
          <div className="word-summary-row">
            {words.map((w, i) => (
              <input
                key={i}
                className="word-input"
                maxLength={20}
                placeholder={['word one', 'word two', 'word three'][i]}
                value={w}
                onChange={e => {
                  const next = [...words];
                  next[i] = enforceOneWord(e.target.value);
                  setWords(next);
                }}
              />
            ))}
          </div>
          {wordCount > 0 && <div className="word-counter">{wordCount} / 3 words</div>}

          <button
            className="modal-submit"
            disabled={!title.trim()}
            onClick={handleSubmit}
          >
            ◈ POST TO FEED
          </button>
          <div style={{ height: 10 }} />
        </div>
      </div>
    </div>
  );
}
