import { useRef } from 'react';

const NAV_ITEMS = [
  { id: 'feed',     icon: '◎', label: 'FEED' },
  { id: 'search',   icon: '⌕', label: 'SEARCH' },
  { id: 'people',   icon: '◉', label: 'PEOPLE' },
  { id: 'trending', icon: '▲', label: 'TRENDING' },
  { id: 'profile',  icon: '◈', label: 'PROFILE' },
];

export default function BottomNav({ current, onNavigate }) {
  const rippleRefs = useRef({});

  function handleClick(id, e) {
    // Ripple effect
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'nav-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top  = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
    onNavigate(id);
  }

  return (
    <nav id="nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          className={`nav-btn${current === item.id ? ' active' : ''}`}
          onClick={e => handleClick(item.id, e)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
