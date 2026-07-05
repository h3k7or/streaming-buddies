export default function FilmStrip({ count = 10 }) {
  return (
    <div className="film-strip">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="film-hole" />
      ))}
    </div>
  );
}
