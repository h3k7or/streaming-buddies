export default function Avatar({ letter, color, size = 26, fontSize = 11 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize,
        background: `${color}22`,
        border: `2px solid ${color}66`,
        color,
      }}
    >
      {letter}
    </div>
  );
}
