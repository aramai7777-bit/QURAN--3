import { getChapter, getVersesByChapter } from '@/lib/quranApi';
import SurahReaderClient from './SurahReaderClient';
import ErrorState from '@/components/ErrorState';

export async function generateMetadata({ params }) {
  try {
    const chapter = await getChapter(params.id);
    return {
      title: `سورة ${chapter.name_arabic} — Surah ${chapter.name_simple}`,
      description: `Read Surah ${chapter.name_simple} (${chapter.name_arabic}) — ${chapter.verses_count} verses, ${chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'} surah.`
    };
  } catch {
    return { title: 'Surah — Quran 3' };
  }
}

export default async function SurahPage({ params }) {
  const chapterId = Number(params.id);
  if (!chapterId || chapterId < 1 || chapterId > 114) {
    return (
      <section className="section container">
        <ErrorState message="رقم السورة غير صحيح." />
      </section>
    );
  }

  try {
    const [chapter, verses] = await Promise.all([
      getChapter(chapterId),
      getVersesByChapter(chapterId)
    ]);
    return <SurahReaderClient chapter={chapter} verses={verses} />;
  } catch (err) {
    return (
      <section className="section container">
        <ErrorState message="تعذّر تحميل هذه السورة الآن. تحقق من اتصالك وحاول مجددًا." />
      </section>
    );
  }
}
