import { useState, useEffect, useRef } from 'react';
import { TYPE_LABELS, STATUS_OPTIONS } from '../../utils/content.js';

export default function LogModal({ open, prefill, modalType, modalStatus, modalRating, modalPosterPath, modalYear, user, dispatch }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [review, setReview] = useState('');
  const [words, setWords] = useState(['', '', '']);
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(prefill || '');
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, prefill]);

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
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const posters = { movie: '🎬', tv: '📺' };
    const entry = {
      id: 'my-' + Date.now(),
      user: user?.displayName || 'You',
      avatar: user?.avatar || 'Y',
      avatarColor: user?.avatarColor || '#E84830',
      type: modalType,
      title: title.trim(),
      year: modalYear || new Date().getFullYear(),
      status: modalStatus,
      rating: modalRating,
      review: review.trim() || null,
      wordSummary: words.map(w => w.trim().toLowerCase()).filter(Boolean),
      genre: genre.trim() || 'General',
      poster: posters[modalType] || '🎬',
      posterPath: modalPosterPath || null,
      time: 'Just now',
      likes: 0,
    };
    dispatch({ type: 'SUBMIT_LOG', entry });
    dispatch({ type: 'SHOW_TOAST', msg: `"${entry.title}" logged!` });
    dispatch({ type: 'SHOW_SCREEN', screen: 'feed' });
    resetForm();
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
          {modalPosterPath && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 2 }}>
              <img
                src={`https://image.tmdb.org/t/p/w92${modalPosterPath}`}
                alt=""
                style={{ width: 52, height: 74, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
                <div style={{ color: 'var(--text)', fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700 }}>{title}</div>
                {modalYear && <div style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 11 }}>{modalYear}</div>}
              </div>
            </div>
          )}
          <div className="modal-label">TITLE</div>
          <input
            ref={titleRef}
            className="modal-text-input"
            placeholder="Title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <div className="modal-label">GENRE</div>
          <input
            className="modal-text-input"
            placeholder="e.g. Sci-Fi, Literary Fiction, True Crime…"
            value={genre}
            onChange={e => setGenre(e.target.value)}
          />

          <div className="modal-label">TYPE</div>
          <div className="chip-row">
            {['movie', 'tv'].map(t => (
              <button
                key={t}
                className={`chip${modalType === t ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_MODAL_TYPE', modalType: t })}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

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

          <div className="modal-label" style={{ marginTop: 8 }}>YOUR 3 WORD SUMMARY</div>
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
          <div className="word-counter">{wordCount} / 3 words</div>

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
