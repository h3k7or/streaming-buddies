import { useEffect } from 'react';

export default function Toast({ msg, dispatch }) {
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
    return () => clearTimeout(timer);
  }, [msg, dispatch]);

  return (
    <div className={`toast${msg ? ' show' : ''}`}>
      {msg}
    </div>
  );
}
