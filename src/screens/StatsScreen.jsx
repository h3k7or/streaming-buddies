const DEMO_ENTRIES = [
  { type: 'movie', status: 'finished', rating: 5, wordSummary: ['epic', 'stunning', 'overwhelming'] },
  { type: 'tv',    status: 'finished', rating: 4, wordSummary: ['gripping', 'excellent', 'tense'] },
  { type: 'movie', status: 'finished', rating: 4, wordSummary: ['quiet', 'devastating', 'beautiful'] },
  { type: 'tv',    status: 'finished', rating: 3, wordSummary: ['fine', 'predictable', 'watchable'] },
  { type: 'movie', status: 'finished', rating: 5, wordSummary: ['masterpiece', 'bold', 'unforgettable'] },
  { type: 'movie', status: 'watching', rating: null, wordSummary: [] },
  { type: 'tv',    status: 'want to watch', rating: null, wordSummary: [] },
];

const BAR_MAX = 160;
const TYPE_COLORS = { movie: '#E84830', tv: '#4A90D9' };
const TYPE_LABELS = { movie: 'Films', tv: 'Series' };

export default function StatsScreen({ active, state, dispatch, onBack }) {
  const entries = state.myEntries.length > 0 ? state.myEntries : DEMO_ENTRIES;

  const finished = entries.filter(e => e.status === 'finished');
  const watching = entries.filter(e => e.status === 'watching');
  const wantTo   = entries.filter(e => e.status === 'want to watch');

  const byType = { movie: 0, tv: 0 };
  const ratingDist = [0, 0, 0, 0, 0];
  const wordFreq = {};

  for (const e of finished) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.rating >= 1 && e.rating <= 5) ratingDist[e.rating - 1]++;
    for (const w of (e.wordSummary || [])) { if (w) wordFreq[w] = (wordFreq[w] || 0) + 1; }
  }

  const rated = finished.filter(e => e.rating);
  const avg = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : null;
  const maxType   = Math.max(...Object.values(byType), 1);
  const maxRating = Math.max(...ratingDist, 1);
  const topWords  = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const streak    = Math.min(entries.length, 7);

  return (
    <div className={`screen screen-stats${active ? ' active' : ''}`} id="screen-stats">
      <div className="notif-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', width: 70 }}>
          <span style={{ color: 'var(--red)', fontSize: 18 }}>←</span>
          <span style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5 }}>BACK</span>
        </button>
        <span className="notif-header-title">MY STATS</span>
        <span style={{ width: 70 }} />
      </div>

      <div className="stats-section-title">OVERVIEW</div>
      <div className="stats-card-row">
        {[['LOGGED', finished.length], ['WATCHING', watching.length], ['WANT TO', wantTo.length]].map(([l, v]) => (
          <div key={l} className="stats-card">
            <div className="stats-val">{v}</div>
            <div className="stats-lbl">{l}</div>
          </div>
        ))}
      </div>

      {avg && (
        <div className="stats-avg-row">
          <span className="stats-avg-lbl">AVERAGE RATING</span>
          <div className="stats-avg-right">
            <span className="stats-avg-val">{avg}</span>
            <span style={{ fontSize: 14, letterSpacing: 1 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: s <= Math.round(avg) ? '#C8A96E' : 'var(--border)' }}>★</span>
              ))}
            </span>
          </div>
        </div>
      )}

      <div className="stats-section-title">BY TYPE</div>
      <div className="stats-bars-card">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className="stats-bar-row">
            <span className="stats-bar-label">{TYPE_LABELS[type]}</span>
            <div className="stats-bar-track">
              <div className="stats-bar-fill" style={{ width: count > 0 ? (count / maxType) * BAR_MAX : 2, background: TYPE_COLORS[type] }} />
            </div>
            <span className="stats-bar-count" style={{ color: TYPE_COLORS[type] }}>{count}</span>
          </div>
        ))}
      </div>

      <div className="stats-section-title">RATING BREAKDOWN</div>
      <div className="stats-bars-card">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="stats-bar-row">
            <span className="stats-bar-label" style={{ color: 'var(--gold)' }}>{'★'.repeat(star)}</span>
            <div className="stats-bar-track">
              <div className="stats-bar-fill" style={{ width: ratingDist[star - 1] > 0 ? (ratingDist[star - 1] / maxRating) * BAR_MAX : 2, background: '#f59e0b', opacity: 0.4 + (star / 5) * 0.6 }} />
            </div>
            <span className="stats-bar-count" style={{ color: 'var(--gold)' }}>{ratingDist[star - 1]}</span>
          </div>
        ))}
      </div>

      {topWords.length > 0 && (
        <>
          <div className="stats-section-title">YOUR TOP WORDS</div>
          <div className="stats-words-grid">
            {topWords.map(([word, count]) => (
              <div key={word} className="stats-word-chip">
                <span className="stats-word">{word}</span>
                <span className="stats-word-count">{count}×</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="stats-section-title">LOGGING STREAK</div>
      <div className="streak-card">
        <div className="streak-num">{streak}</div>
        <div className="streak-lbl">day streak</div>
        <div className="streak-dots">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`streak-dot${i < streak ? ' active' : ''}`} />
          ))}
        </div>
      </div>
      <div className="pb-safe" />
    </div>
  );
}
