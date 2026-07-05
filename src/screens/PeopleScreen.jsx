import { useState } from 'react';
import PersonCard from '../components/cards/PersonCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { addFollow, removeFollow } from '../utils/api.js';

export default function PeopleScreen({ active, state, dispatch, onToast }) {
  const { people, peopleTab, user } = state;
  const [inviteEmail, setInviteEmail] = useState('');
  const shown = peopleTab === 'friends' ? people.filter(p => p.isFollowing) : people.filter(p => !p.isFollowing);

  async function handleFollow(id) {
    const p = people.find(p => p.id === id);
    dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id });
    if (p) dispatch({ type: 'SHOW_TOAST', msg: p.isFollowing ? `Unfollowed ${p.displayName}` : `Following ${p.displayName}` });
    try {
      if (p?.isFollowing) await removeFollow(id, user.id);
      else await addFollow(id, user.id);
    } catch {
      dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id });
    }
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    const from = user?.displayName || 'A friend';
    const subject = `${from} invited you to StreamingBuddies`;
    const body = `Hey!\n\n${from} has invited you to join StreamingBuddies — a social watchlog for films and TV series.\n\nTrack what you watch, share reviews, and see what your friends are watching.\n\nJoin here: https://streaming-buddies.vercel.app\n\nSee you there!`;
    window.location.href = `mailto:${encodeURIComponent(inviteEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setInviteEmail('');
    onToast('Invite opened in your mail app');
  }

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-people">
      <div className="people-tabs">
        <button className={`people-tab${peopleTab === 'friends' ? ' active' : ''}`} onClick={() => dispatch({ type: 'SET_PEOPLE_TAB', tab: 'friends' })}>FRIENDS</button>
        <button className={`people-tab${peopleTab === 'discover' ? ' active' : ''}`} onClick={() => dispatch({ type: 'SET_PEOPLE_TAB', tab: 'discover' })}>DISCOVER</button>
      </div>

      {/* Invite section — always visible */}
      <div style={{ margin: '12px 16px', padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--dim)', marginBottom: 10 }}>◈ INVITE A FRIEND</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="their@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            style={{
              flex: 1,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              padding: '8px 12px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleInvite}
            disabled={!inviteEmail.trim()}
            style={{
              background: inviteEmail.trim() ? 'var(--red)' : 'var(--border)',
              color: inviteEmail.trim() ? '#fff' : 'var(--dim)',
              border: 'none',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: 1.5,
              padding: '8px 14px',
              cursor: inviteEmail.trim() ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
          >
            SEND
          </button>
        </div>
      </div>

      <div id="people-list">
        {shown.length === 0 ? (
          <EmptyState
            emoji={peopleTab === 'friends' ? '👥' : '🌐'}
            title={peopleTab === 'friends' ? 'Not following anyone yet' : 'No suggestions right now'}
            hint={peopleTab === 'friends' ? 'Discover people in the other tab' : 'Check back later'}
          />
        ) : (
          <>
            {shown.map(p => (
              <PersonCard key={p.id} person={p} onFollow={handleFollow} onToast={onToast} />
            ))}
            <div className="pb-safe" />
          </>
        )}
      </div>
    </div>
  );
}
