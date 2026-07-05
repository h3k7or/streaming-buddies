import { useState } from 'react';
import { OB_SLIDES } from '../../utils/content.js';

function FilmHoles() {
  return (
    <div className="ob-strip">
      {Array.from({ length: 14 }, (_, i) => <div key={i} className="ob-hole" />)}
    </div>
  );
}

export default function Onboarding({ visible, dispatch }) {
  const [page, setPage] = useState(0);
  const isLast = page === OB_SLIDES.length - 1;
  const slide = OB_SLIDES[page];

  function finish() {
    dispatch({ type: 'FINISH_ONBOARDING' });
  }

  function next() {
    if (!isLast) setPage(p => p + 1);
    else finish();
  }

  return (
    <div className={`onboarding${visible ? ' visible' : ''}`}>
      <FilmHoles />
      <div className="ob-logo-row">
        <div className="ob-logo">
          <span style={{ color: 'var(--red)' }}>STREAMING</span>
          <span style={{ color: 'var(--text)' }}>BUDDIES</span>
        </div>
      </div>

      <div className="ob-slide" key={page}>
        <div className="ob-emoji-wrap" style={{ borderColor: `${slide.color}44` }}>
          {slide.emoji}
        </div>
        <div className="ob-title">
          {slide.title.split('\n').map((line, i) => (
            <span key={i}>{line}{i < slide.title.split('\n').length - 1 && <br />}</span>
          ))}
        </div>
        <div className="ob-body">{slide.body}</div>
      </div>

      <div className="ob-dots">
        {OB_SLIDES.map((_, i) => (
          <div key={i} className={`ob-dot${i === page ? ' active' : ''}`} onClick={() => setPage(i)} />
        ))}
      </div>

      <div className="ob-actions">
        <button className="ob-primary" onClick={next}>
          {isLast ? '▶ GET STARTED' : 'NEXT →'}
        </button>
        {!isLast && (
          <button className="ob-skip" onClick={finish}>SKIP</button>
        )}
      </div>
      <FilmHoles />
    </div>
  );
}
