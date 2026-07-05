import Avatar from '../ui/Avatar.jsx';
import Stars from '../ui/Stars.jsx';

export default function PersonCard({ person, onFollow, onToast }) {
  return (
    <div className="person-card">
      <Avatar letter={person.avatar} color={person.avatarColor} size={46} fontSize={18} />
      <div className="person-info">
        <div className="person-name-row">
          <span className="person-name">{person.displayName}</span>
          <span className="person-username">@{person.username}</span>
        </div>
        {person.bio && <div className="person-bio">{person.bio}</div>}
        <div className="person-stats">
          <span className="person-stat"><b>{person.entriesCount}</b> logged</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="person-stat"><b>{person.followers}</b> followers</span>
        </div>
        {person.lastEntry && (
          <div className="person-last">
            <span className="person-last-emoji">{person.lastEntry.poster}</span>
            <span className="person-last-title">{person.lastEntry.title}</span>
            <Stars rating={person.lastEntry.rating} size={9} />
          </div>
        )}
      </div>
      <button
        className={`follow-btn${person.isFollowing ? ' following' : ''}`}
        onClick={() => onFollow(person.id)}
      >
        {person.isFollowing ? 'FOLLOWING' : '+ FOLLOW'}
      </button>
    </div>
  );
}
