import PersonCard from '../components/cards/PersonCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function PeopleScreen({ active, state, dispatch, onToast }) {
  const { people, peopleTab } = state;
  const shown = peopleTab === 'friends' ? people.filter(p => p.isFollowing) : people.filter(p => !p.isFollowing);

  function handleFollow(id) {
    const p = people.find(p => p.id === id);
    dispatch({ type: 'TOGGLE_FOLLOW', id });
    if (p) dispatch({ type: 'SHOW_TOAST', msg: p.isFollowing ? `Unfollowed ${p.displayName}` : `Following ${p.displayName}` });
  }

  return (
    <div className={`screen${active ? ' active' : ''}`} id="screen-people">
      <div className="people-tabs">
        <button className={`people-tab${peopleTab === 'friends' ? ' active' : ''}`} onClick={() => dispatch({ type: 'SET_PEOPLE_TAB', tab: 'friends' })}>FRIENDS</button>
        <button className={`people-tab${peopleTab === 'discover' ? ' active' : ''}`} onClick={() => dispatch({ type: 'SET_PEOPLE_TAB', tab: 'discover' })}>DISCOVER</button>
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
