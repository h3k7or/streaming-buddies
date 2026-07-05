function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster skel" />
      <div className="skeleton-lines">
        <div className="skel-row">
          <div className="skel skel-xs" />
          <div className="skel skel-xs" style={{ width: 60 }} />
        </div>
        <div className="skel skel-md" />
        <div className="skel-row">
          <div className="skel skel-xs" />
          <div className="skel skel-xs" />
        </div>
        <div className="skel skel-sm" />
        <div className="skel skel-lg" />
        <div className="skel skel-md" style={{ width: '55%' }} />
      </div>
    </div>
  );
}

export default function Skeleton({ count = 4 }) {
  return (
    <div className="skeleton-wrap">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
