import Stars from '../ui/Stars.jsx';
import Badge from '../ui/Badge.jsx';
import { TYPE_LABELS, TYPE_COLORS } from '../../utils/content.js';

export default function TrendingRow({ item, rank, onClick }) {
  const typeColor = TYPE_COLORS[item.type] || '#E84830';
  return (
    <div className="trending-row" onClick={() => onClick(item.id)}>
      <span className="trend-rank">#{rank}</span>
      <div className="trend-poster">
        <span style={{ fontSize: 26 }}>{item.poster}</span>
      </div>
      <div className="trend-info">
        <div className="trend-title">{item.title}</div>
        <div className="trend-meta">
          <Badge label={TYPE_LABELS[item.type]} color={typeColor} />
          <Stars rating={Math.round(item.rating)} size={10} />
          <span className="trend-rating">{item.rating}/5</span>
        </div>
      </div>
      <div className="watcher-box">
        <div className="watcher-count">{item.watchers}</div>
        <div className="watcher-label">WATCHING</div>
      </div>
    </div>
  );
}
