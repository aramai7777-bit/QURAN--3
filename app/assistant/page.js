import AssistantClient from './AssistantClient';

export const metadata = { title: 'المساعد الذكي — AI Quran Assistant' };

export default function AssistantPage() {
  return (
    <section className="section container ai-section">
      <div className="glass ai-panel">
        <div className="ai-panel-head">
          <div className="ai-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a7 7 0 00-7 7c0 3 2 4.6 2 7v1h10v-1c0-2.4 2-4 2-7a7 7 0 00-7-7z" /><path d="M9 21h6" /></svg>
          </div>
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>المساعد الذكي للقرآن</h1>
            <p className="section-sub" style={{ margin: '4px 0 0' }}>Ask in natural language — get verified verses, never invented ones</p>
          </div>
        </div>
        <p className="ai-disclaimer">
          هذا المساعد يبحث ضمن نص القرآن الكريم الموثّق فقط ولا يقوم بإنشاء آيات. أي شرح مصاحب هو معلومات عامة وليس نصًا قرآنيًا أو تفسيرًا معتمدًا، ويجب دائمًا الرجوع إلى مصحف وتفسير موثوقين للتأكد.
        </p>
        <AssistantClient />
      </div>
    </section>
  );
}
