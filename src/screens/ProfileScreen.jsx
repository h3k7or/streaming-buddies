import Stars from '../components/ui/Stars.jsx';
import Badge from '../components/ui/Badge.jsx';
import { TYPE_LABELS, TYPE_COLORS } from '../utils/content.js';

export default function ProfileScreen({ active, state, dispatch, actions, onOpenModal, onToast, onNavigate }) {
  const { user, myEntries } = state;
  const u = user || {};
  const watched  = myEntries.filter(e => e.status === 'finished').length;
  const watching = myEntries.filter(e => e.status === 'watching').length;
  const wantTo   = myEntries.filter(e => e.status === 'want to watch').length;
  const initial  = (u.displayName?.[0] || 'Y').toUpperCase();

  function handleLogout() {
    if (!window.confirm('Sign out of StreamingBuddies?')) return;
    actions.logout();
  }

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-profile">
      <div className="profile-hero">
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, background: `${u.avatarColor || '#E84830'}22`, border: `2px solid ${u.avatarColor || '#E84830'}66`, color: u.avatarColor || '#E84830' }}>
          {initial}
        </div>
        <div className="profile-name">{u.displayName || 'You'}</div>
        {u.username && <div className="profile-handle">@{u.username}</div>}
        {u.bio
          ? <div className="profile-bio">{u.bio}</div>
          : <div style={{ color: 'var(--tiny)', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 3 }}>◈ CINEPHILE ◈</div>
        }
      </div>

      <div className="stats-row">
        {[['WATCHED', watched], ['WATCHING', watching], ['WANT TO SEE', wantTo], ['FRIENDS', 6]].map(([l, v]) => (
          <div key={l} className="stat-box">
            <div className="stat-val">{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      <div className="section-header">◎ YOUR RECENT LOGS</div>

      {myEntries.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 30px' }}>
          <span className="empty-emoji">📋</span>
          <div className="empty-title" style={{ fontSize: 15 }}>No entries yet</div>
          <div className="empty-hint">Log something!</div>
          <button className="empty-btn" onClick={() => onOpenModal()}>+ LOG SOMETHING</button>
        </div>
      ) : (
        myEntries.map(item => (
          <div key={item.id} className="entry-row">
            <span className="entry-poster">{item.poster}</span>
            <div className="entry-info">
              <div className="entry-title">{item.title}</div>
              <div className="entry-meta">
                <Badge label={TYPE_LABELS[item.type]} color={TYPE_COLORS[item.type]} />
                <Stars rating={item.rating} size={11} />
              </div>
            </div>
            <span className="entry-time">{item.time || 'Just now'}</span>
          </div>
        ))
      )}

      <div className="settings-section">
        <div className="settings-lbl">SETTINGS</div>
        {[
          { label: 'Edit profile',            onClick: () => onToast('Edit profile coming soon') },
          { label: 'Connect Trakt account',   onClick: () => onToast('Connect Trakt coming soon') },
          { label: 'Notifications',           onClick: () => onNavigate('notifications') },
          { label: 'My stats & insights',     onClick: () => onNavigate('stats') },
        ].map(row => (
          <div key={row.label} className="settings-row" onClick={row.onClick}>
            <span className="settings-row-text">{row.label}</span>
            <span className="settings-arrow">›</span>
          </div>
        ))}
        <div className="settings-row danger" onClick={handleLogout}>
          <span className="settings-row-text">Sign out</span>
        </div>
      </div>
      <div className="pb-safe" />
    </div>
  );
}
