export default function Header({ onLogClick }) {
  return (
    <div id="header">
      <div>
        <div className="logo">
          <span style={{ color: 'var(--red)' }}>STREAMING</span>
          <span style={{ color: 'var(--text)' }}>BUDDIES</span>
        </div>
        <div className="tagline">◈ SOCIAL WATCHLOG ◈</div>
      </div>
      <button id="log-btn" onClick={onLogClick}>+ LOG</button>
    </div>
  );
}
