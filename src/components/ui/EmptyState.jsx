export default function EmptyState({ emoji, title, hint, action }) {
  return (
    <div className="empty-state">
      <span className="empty-emoji">{emoji}</span>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {action && (
        <button className="empty-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
