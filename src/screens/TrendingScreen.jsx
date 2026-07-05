import { useState, useEffect } from 'react';
import TrendingRow from '../components/cards/TrendingRow.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

const FILTERS = [['all', 'ALL'], ['movie', 'FILMS'], ['tv', 'SERIES']];

export default function TrendingScreen({ active, state, dispatch, onDetail }) {
  const [loading, setLoading] = useState(false);
  const { trending, trendFilter } = state;

  useEffect(() => {
    if (active) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 320);
      return () => clearTimeout(t);
    }
  }, [active, trendFilter]);

  const items = trendFilter === 'all' ? trending : trending.filter(i => i.type === trendFilter);

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-trending">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
        <span>◎ THIS WEEK'S MOST WATCHED</span>
      </div>
      <div className="filter-bar">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            className={`filter-btn${trendFilter === k ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TREND_FILTER', filter: k })}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton count={4} />
      ) : (
        <>
          {items.map((item, i) => (
            <TrendingRow key={item.id} item={item} rank={i + 1} onClick={onDetail} />
          ))}
          <div className="pb-safe" />
        </>
      )}
    </div>
  );
}
