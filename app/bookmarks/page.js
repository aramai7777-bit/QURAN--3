import BookmarksClient from './BookmarksClient';

export const metadata = { title: 'المحفوظات — Bookmarks' };

export default function BookmarksPage() {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h1 className="section-title">الآيات المحفوظة</h1><p className="section-sub">Your bookmarked verses, saved on this device</p></div>
      </div>
      <BookmarksClient />
    </section>
  );
}
