import RecitersIndexClient from './RecitersIndexClient';

export const metadata = {
  title: 'القرّاء — Reciters',
  description: 'Search and listen to Quran recitations by renowned reciters.'
};

export default function RecitersPage() {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h1 className="section-title">القرّاء</h1><p className="section-sub">Find and listen to your favorite reciter</p></div>
      </div>
      <RecitersIndexClient />
    </section>
  );
}
