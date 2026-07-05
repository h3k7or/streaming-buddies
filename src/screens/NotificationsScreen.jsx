import Avatar from '../components/ui/Avatar.jsx';
import { NOTIF_ICONS, NOTIF_COLORS } from '../utils/content.js';

export default function NotificationsScreen({ active, state, dispatch, actions, onBack }) {
  const { notifications } = state;
  const unread = notifications.filter(n => !n.read).length;

  function getNotifText(n) {
    if (n.type === 'like')    return <><span className="notif-actor">{n.user}</span> <span className="notif-body">liked your log{n.entryTitle ? <> of <b>{n.entryTitle}</b></> : ''}</span></>;
    if (n.type === 'follow')  return <><span className="notif-actor">{n.user}</span> <span className="notif-body">started following you</span></>;
    if (n.type === 'comment') return <><span className="notif-actor">{n.user}</span> <span className="notif-body">commented on your log{n.entryTitle ? <> of <b>{n.entryTitle}</b></> : ''}</span></>;
    return null;
  }

  return (
    <div className={`screen screen-notifications${active ? ' active' : ''}`} id="screen-notifications">
      <div className="notif-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', width: 70 }}>
          <span style={{ color: 'var(--red)', fontSize: 18 }}>←</span>
          <span style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5 }}>BACK</span>
        </button>
        <span className="notif-header-title">
          NOTIFICATIONS{unread > 0 && <span className="notif-badge"> {unread}</span>}
        </span>
        {unread > 0
          ? <button className="notif-mark-all" onClick={() => actions.markAllRead()}>ALL READ</button>
          : <span style={{ width: 70 }} />
        }
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 40px' }}>
          <span className="empty-emoji">🔔</span>
          <div className="empty-title" style={{ fontSize: 16 }}>All caught up</div>
          <div className="empty-hint">When friends like or comment on your logs, they'll appear here</div>
        </div>
      ) : (
        <>
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notif-row${n.read ? '' : ' unread'}`}
              onClick={() => dispatch({ type: 'MARK_ALL_NOTIF_READ' })}
            >
              <div className="notif-dot-col">
                {!n.read && <div className="notif-dot" />}
              </div>
              <div className="notif-type-icon" style={{ background: `${NOTIF_COLORS[n.type]}18`, borderColor: `${NOTIF_COLORS[n.type]}44`, color: NOTIF_COLORS[n.type] }}>
                {NOTIF_ICONS[n.type]}
              </div>
              <Avatar letter={n.avatar} color={n.avatarColor} size={34} fontSize={13} />
              <div className="notif-content">
                <div className="notif-text">{getNotifText(n)}</div>
                {n.comment && <div className="notif-comment">"{n.comment}"</div>}
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
          <div className="pb-safe" />
        </>
      )}
    </div>
  );
}
