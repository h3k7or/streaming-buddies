export default function Stars({ rating, size = 13 }) {
  if (!rating) {
    return <span style={{ color: '#888', fontSize: size - 2, fontFamily: 'var(--mono)' }}>Not rated</span>;
  }
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className="star" style={{ fontSize: size, color: s <= rating ? '#C8A96E' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}
