import Link from 'next/link';

function initials(name) {
  return (name || '?').trim().split(' ').slice(0, 2).map((w) => w[0]).join('');
}

export default function ReciterCard({ reciter, isFavorite, onToggleFavorite }) {
  return (
    <div className="reciter-card">
      <button
        className={`fav-btn ${isFavorite ? 'active' : ''}`}
        aria-label="إضافة للمفضلة"
        onClick={(e) => { e.preventDefault(); onToggleFavorite?.(reciter.id); }}
      >
        <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
        </svg>
      </button>
      <Link href={`/reciters/${reciter.id}`} className="reciter-card-link">
        <div className="reciter-avatar">{initials(reciter.name)}</div>
        <div className="name-ar arabic">{reciter.name}</div>
        <div className="name-en">
          {reciter.moshaf.length} {reciter.moshaf.length > 1 ? 'روايات' : 'رواية'}
        </div>
        <span className="style-tag">{reciter.moshaf[0].name}</span>
      </Link>
    </div>
  );
}
