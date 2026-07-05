import { useState, useEffect } from 'react';
import FeedCard from '../components/cards/FeedCard.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const FILTERS = [['all', 'All'], ['movie', 'Films'], ['tv', 'Series']];

export default function FeedScreen({ active, state, dispatch, onDetail, onOpenModal, onToast }) {
  const [loading, setLoading] = useState(false);
  const { feed, feedFilter, liked } = state;

  useEffect(() => {
    if (active) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 280);
      return () => clearTimeout(t);
    }
  }, [active, feedFilter]);

  const items = feedFilter === 'all' ? feed : feed.filter(i => i.type === feedFilter);

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-feed">
      <div className="filter-bar">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            className={`filter-btn${feedFilter === k ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_FEED_FILTER', filter: k })}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton count={Math.min(items.length || 3, 4)} />
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🎬"
          title="Your feed is empty"
          hint={feedFilter !== 'all' ? 'Nothing in this category yet' : 'Follow friends or log something'}
          action={feedFilter === 'all' ? { label: '+ LOG SOMETHING', onClick: () => onOpenModal() } : null}
        />
      ) : (
        <>
          {items.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              liked={liked.has(item.id)}
              onLike={id => dispatch({ type: 'TOGGLE_LIKE', id })}
              onDetail={onDetail}
              onToast={onToast}
            />
          ))}
          <div className="pb-safe" />
        </>
      )}
    </div>
  );
}
