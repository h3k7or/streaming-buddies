import { useState } from 'react';
import PersonCard from '../components/cards/PersonCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { addFollow, removeFollow, searchProfiles } from '../utils/api.js';

export default function PeopleScreen({ active, state, dispatch, onToast }) {
  const { people, peopleTab, user } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const shown = peopleTab === 'friends' ? people.filter(p => p.isFollowing) : people.filter(p => !p.isFollowing);

  async function handleFollow(id, listOverride) {
    const list = listOverride || (searched ? searchResults : people);
    const p = list.find(p => p.id === id);
    dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id });
    if (searched) {
      setSearchResults(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));
    }
    if (p) dispatch({ type: 'SHOW_TOAST', msg: p.isFollowing ? `Unfollowed ${p.displayName}` : `Following ${p.displayName}` });
    try {
      if (p?.isFollowing) await removeFollow(id, user.id);
      else await addFollow(id, user.id);
    } catch {
      dispatch({ type: 'TOGGLE_FOLLOW_LOCAL', id });
      if (searched) setSearchResults(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const results = await searchProfiles(searchQuery.trim(), user.id);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
  }

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-people">
      <div className="people-tabs">
        <button className={`people-tab${peopleTab === 'friends' ? ' active' : ''}`} onClick={() => { dispatch({ type: 'SET_PEOPLE_TAB', tab: 'friends' }); clearSearch(); }}>FRIENDS</button>
        <button className={`people-tab${peopleTab === 'discover' ? ' active' : ''}`} onClick={() => { dispatch({ type: 'SET_PEOPLE_TAB', tab: 'discover' }); clearSearch(); }}>DISCOVER</button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, margin: '12px 16px 4px' }}>
        <input
          type="text"
          placeholder="Search by username…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) clearSearch(); }}
          style={{
            flex: 1,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!searchQuery.trim() || searching}
          style={{
            background: searchQuery.trim() ? 'var(--red)' : 'var(--border)',
            color: searchQuery.trim() ? '#fff' : 'var(--dim)',
            border: 'none',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: 1.5,
            padding: '8px 14px',
            cursor: searchQuery.trim() ? 'pointer' : 'default',
          }}
        >
          {searching ? '…' : 'FIND'}
        </button>
      </form>

      <div id="people-list">
        {searched ? (
          searchResults.length === 0 ? (
            <EmptyState emoji="🔍" title="No users found" hint={`No one matching "${searchQuery}"`} />
          ) : (
            <>
              {searchResults.map(p => (
                <PersonCard key={p.id} person={p} onFollow={id => handleFollow(id, searchResults)} onToast={onToast} />
              ))}
              <div className="pb-safe" />
            </>
          )
        ) : shown.length === 0 ? (
          <EmptyState
            emoji={peopleTab === 'friends' ? '👥' : '🌐'}
            title={peopleTab === 'friends' ? 'Not following anyone yet' : 'No suggestions right now'}
            hint={peopleTab === 'friends' ? 'Search for friends above' : 'Search by username above'}
          />
        ) : (
          <>
            {shown.map(p => (
              <PersonCard key={p.id} person={p} onFollow={id => handleFollow(id, null)} onToast={onToast} />
            ))}
            <div className="pb-safe" />
          </>
        )}
      </div>
    </div>
  );
}
