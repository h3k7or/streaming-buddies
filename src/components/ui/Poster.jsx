import { useState } from 'react';
import { posterUrl, POSTER_SM } from '../../utils/tmdb.js';

export default function Poster({ posterPath, emoji, width, height, fontSize }) {
  const [imgError, setImgError] = useState(false);
  const src = posterPath ? posterUrl(posterPath, POSTER_SM) : null;

  const style = {
    width,
    height,
    flexShrink: 0,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  if (src && !imgError) {
    return (
      <div style={style}>
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div style={style}>
      <span style={{ fontSize: fontSize || 26 }}>{emoji || '🎬'}</span>
    </div>
  );
}
