import Stars from '../components/ui/Stars.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import FilmStrip from '../components/ui/FilmStrip.jsx';
import Badge from '../components/ui/Badge.jsx';
import Poster from '../components/ui/Poster.jsx';
import { TYPE_LABELS, TYPE_COLORS, STATUS_COLORS, getStatusLabel, getStatusIcon } from '../utils/content.js';

export default function DetailScreen({ active, state, dispatch, itemId, onBack, onToast }) {
  const { feed, trending, liked } = state;
  const item = itemId ? (feed.find(i => i.id === itemId) || trending.find(i => i.id === itemId)) : null;

  function handleLike() {
    if (!item) return;
    dispatch({ type: 'TOGGLE_LIKE', id: item.id });
  }

  function handleShare() {
    if (!item) return;
    if (navigator.share) {
      navigator.share({ title: 'StreamingBuddies', text: `Check out "${item.title}" on StreamingBuddies` });
    } else {
      navigator.clipboard?.writeText(`Check out "${item.title}" on StreamingBuddies`);
      onToast('Link copied!');
    }
  }

  if (!item) {
    return <div className={`screen screen-detail${active ? ' active' : ''}`} id="screen-detail" style={{ background: 'var(--bg)' }} />;
  }

  const isLiked = liked.has(item.id);
  const typeColor = TYPE_COLORS[item.type] || '#E84830';
  const statusColor = STATUS_COLORS[item.status] || '#999';

  return (
    <div className={`screen screen-detail${active ? ' active' : ''}`} id="screen-detail" style={{ background: 'var(--bg)' }}>
      <div className="detail-nav">
        <button className="detail-back" onClick={onBack}>
          <span className="detail-back-arrow">←</span>
          <span className="detail-back-label">BACK</span>
        </button>
        <button className="detail-share" onClick={handleShare}>↗ SHARE</button>
      </div>

      <div className="detail-hero" style={{ borderBottom: `3px solid ${typeColor}88` }}>
        <div className="detail-poster" style={{ overflow: 'hidden' }}>
          <Poster posterPath={item.posterPath} emoji={item.poster} width={80} height={112} fontSize={38} />
          <div className="detail-poster-bar" style={{ background: typeColor }} />
        </div>
        <div className="detail-info">
          <div className="detail-title">{item.title}</div>
          {item.year && <div className="detail-year">{item.year}</div>}
          <div className="badges" style={{ marginTop: 4 }}>
            <Badge label={TYPE_LABELS[item.type] || item.type} color={typeColor} />
          </div>
          {item.genre && <div className="detail-genre">{item.genre}</div>}
        </div>
      </div>

      <FilmStrip />

      <div className="detail-section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Stars rating={item.rating} size={26} />
        {item.rating && <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 14 }}>{item.rating}/5</span>}
      </div>

      {item.status && (
        <div className="detail-section">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1, color: statusColor }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: `${statusColor}22`, border: `1px solid ${statusColor}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
              {getStatusIcon(item.status)}
            </span>
            {getStatusLabel(item.status)}
          </span>
        </div>
      )}

      {item.review && (
        <div className="detail-section">
          <div className="detail-section-label">REVIEW</div>
          <div className="detail-review-text">"{item.review}"</div>
        </div>
      )}

      {item.wordSummary?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-label">3 WORD SUMMARY</div>
          <div className="summary-pills" style={{ paddingTop: 2 }}>
            {item.wordSummary.map(w => (
              <span key={w} className="summary-pill" style={{ fontSize: 11, padding: '4px 12px' }}>{w}</span>
            ))}
          </div>
        </div>
      )}

      {item.user && (
        <div className="detail-section">
          <div className="detail-section-label">LOGGED BY</div>
          <div className="detail-logged-by">
            <Avatar letter={item.avatar || '?'} color={item.avatarColor || '#E84830'} size={40} fontSize={16} />
            <div>
              <div className="detail-logged-name">{item.user}</div>
              {item.time && <div className="detail-logged-time">{item.time}</div>}
            </div>
          </div>
        </div>
      )}

      <FilmStrip />

      <div className="detail-actions">
        <button className={`detail-action${isLiked ? ' liked' : ''}`} onClick={handleLike}>
          <span className="detail-action-icon">{isLiked ? '♥' : '♡'}</span>
          <span>{(item.likes || 0) + (isLiked ? 1 : 0)} LIKES</span>
        </button>
        <button className="detail-action" onClick={() => onToast('Reply coming soon')}>
          <span className="detail-action-icon">◻</span> COMMENT
        </button>
        <button className="detail-action" onClick={() => onToast('Saved!')}>
          <span className="detail-action-icon">+</span> SAVE
        </button>
      </div>
      <div className="pb-safe" />
    </div>
  );
}
