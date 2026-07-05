export const TYPE_LABELS = { movie: 'Film', tv: 'Series' };
export const TYPE_COLORS = { movie: '#E84830', tv: '#4A90D9' };
export const STATUS_COLORS = { finished: '#3CC68A', watching: '#E84830', 'want to watch': '#4A5268' };

export const OB_SLIDES = [
  { emoji: '🎬', title: 'Track everything\nyou watch', body: 'Every film and series you watch — rated, reviewed, and remembered in one place.', color: '#E84830' },
  { emoji: '◉',  title: 'See what your\nfriends are into', body: 'A real-time feed of what your circle is watching. Discover things you never would have found alone.', color: '#3CC68A' },
  { emoji: '★',  title: 'Rate, review\nand remember', body: 'One to five stars, a short review, and a watch status. Simple enough to actually use every day.', color: '#C8A96E' },
];

export const NOTIF_ICONS  = { like: '♥', follow: '◉', comment: '◻' };
export const NOTIF_COLORS = { like: '#E84830', follow: '#3CC68A', comment: '#4A90D9' };

export const STATUS_OPTIONS = [
  { value: 'finished',      label: 'Watched',       icon: '✓' },
  { value: 'watching',      label: 'Watching',      icon: '▶' },
  { value: 'want to watch', label: 'Want to Watch', icon: '+' },
];

export function getStatusLabel(status) {
  const map = { finished: 'Watched', watching: 'Watching', 'want to watch': 'Want to Watch' };
  return map[status] || status;
}

export function getStatusIcon(status) {
  if (status === 'finished') return '✓';
  if (status === 'watching') return '▶';
  return '+';
}

export function getNotifText(n) {
  if (n.type === 'like')    return { prefix: '', bold: n.target, suffix: '' , verb: 'liked your log of' };
  if (n.type === 'follow')  return { prefix: '', bold: null, suffix: 'started following you', verb: '' };
  if (n.type === 'comment') return { prefix: '', bold: n.target, suffix: '', verb: 'commented on your log of' };
  return { prefix: '', bold: null, suffix: '' };
}

export const BROWSE_TILES = [
  { type: 'movie', emoji: '🎬', label: 'Films',  color: '#E84830' },
  { type: 'tv',    emoji: '📺', label: 'Series', color: '#3CC68A' },
];

export const RECENT_SEARCHES = ['Dune', 'Shōgun', 'The Bear', 'Severance', 'Succession'];
