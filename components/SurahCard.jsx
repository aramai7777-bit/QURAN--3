import Link from 'next/link';

export default function SurahCard({ chapter }) {
  return (
    <Link href={`/surah/${chapter.id}`} className="surah-card">
      <div className="surah-num"><span>{chapter.id}</span></div>
      <div className="surah-info">
        <div className="en">{chapter.name_simple}</div>
        <div className="meta">
          {chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} · {chapter.verses_count} آية
        </div>
      </div>
      <div className="surah-ar quran-text">{chapter.name_arabic}</div>
    </Link>
  );
}
