export default function LoadingSkeleton({ count = 6, height = 76 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ height }} />
      ))}
    </div>
  );
}
