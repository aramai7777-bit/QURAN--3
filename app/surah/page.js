import SurahIndexClient from './SurahIndexClient';

export const metadata = {
  title: 'تصفّح السور',
  description: 'Browse all 114 Surahs of the Holy Quran with Arabic names, verse counts, and revelation place.'
};

export default function SurahIndexPage() {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h1 className="section-title">تصفّح السور</h1><p className="section-sub">Browse all 114 Surahs of the Holy Quran</p></div>
      </div>
      <SurahIndexClient />
    </section>
  );
}
