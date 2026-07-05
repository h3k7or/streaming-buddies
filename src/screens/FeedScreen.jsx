import { useState, useEffect } from 'react';
import FeedCard from '../components/cards/FeedCard.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { addLike, removeLike } from '../utils/api.js';

const FILTERS = [['all', 'All'], ['movie', 'Films'], ['tv', 'Series']];

export default function FeedScreen({ active, state, dispatch, onDetail, onOpenModal, onToast }) {
  const [loading, setLoading] = useState(false);
  const { feed, feedFilter, liked, user } = state;

  useEffect(() => {
    if (active) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 280);
      return () => clearTimeout(t);
    }
  }, [active, feedFilter]);

  async function handleLike(id) {
    const isLiked = liked.has(id);
    dispatch({ type: 'TOGGLE_LIKE_LOCAL', id });
    try {
      if (isLiked) await removeLike(id, user.id);
      else await addLike(id, user.id);
    } catch {
      dispatch({ type: 'TOGGLE_LIKE_LOCAL', id }); // revert
    }
  }

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
              onLike={handleLike}
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
