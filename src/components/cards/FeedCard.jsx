import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';
import Stars from '../ui/Stars.jsx';
import FilmStrip from '../ui/FilmStrip.jsx';
import Badge from '../ui/Badge.jsx';
import { TYPE_LABELS, TYPE_COLORS, STATUS_COLORS, getStatusLabel, getStatusIcon } from '../../utils/content.js';

export default function FeedCard({ item, liked, onLike, onDetail, onToast }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[item.type] || '#888';
  const statusColor = STATUS_COLORS[item.status] || '#999';

  function handleLike(e) {
    e.stopPropagation();
    onLike(item.id);
    // Pulse handled via CSS class toggling below
  }

  return (
    <div className="feed-card" id={`card-${item.id}`}>
      <FilmStrip />
      <div className="card-body" onClick={() => onDetail(item.id)}>
        <div className="poster-box">
          <span style={{ fontSize: 26 }}>{item.poster}</span>
          <div className="poster-bar" />
        </div>
        <div className="card-content">
          <div className="card-user-row">
            <Avatar letter={item.avatar} color={item.avatarColor} size={26} fontSize={11} />
            <span className="card-username">{item.user}</span>
            <span className="card-time">{item.time}</span>
          </div>
          <div className="card-title-row">
            <span className="card-title">{item.title}</span>
            <span className="card-year">{item.year}</span>
          </div>
          <div className="badges">
            <Badge label={TYPE_LABELS[item.type]} color={typeColor} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1, color: statusColor }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: `${statusColor}22`, border: `1px solid ${statusColor}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>
                {getStatusIcon(item.status)}
              </span>
              {getStatusLabel(item.status)}
            </span>
          </div>
          <Stars rating={item.rating} size={12} />
          {item.review && (
            <>
              <div className={`card-review${expanded ? ' expanded' : ''}`}>
                "{item.review}"
              </div>
              {item.review.length > 80 && (
                <button className="expand-btn" onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}>
                  {expanded ? '▲ LESS' : '▼ MORE'}
                </button>
              )}
            </>
          )}
          {item.wordSummary?.length > 0 && (
            <div className="summary-pills">
              {item.wordSummary.map(w => (
                <span key={w} className="summary-pill">{w}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card-actions">
        <button className={`action-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
          <span className="action-icon">{liked ? '♥' : '♡'}</span>
          <span>{item.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="action-btn" onClick={() => onToast('Reply coming soon')}>
          <span className="action-icon">◻</span> REPLY
        </button>
        <button className="action-btn" onClick={() => onToast('Saved!')}>
          <span className="action-icon">+</span> SAVE
        </button>
      </div>
      <FilmStrip />
    </div>
  );
}
