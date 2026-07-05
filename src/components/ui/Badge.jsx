export default function Badge({ label, color }) {
  return (
    <span className="badge" style={{ color, borderColor: `${color}44` }}>
      {label}
    </span>
  );
}
