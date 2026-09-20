import SettingsClient from './SettingsClient';

export const metadata = { title: 'الإعدادات — Settings' };

export default function SettingsPage() {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h1 className="section-title">الإعدادات</h1><p className="section-sub">Reading, audio, and general preferences — saved on this device</p></div>
      </div>
      <SettingsClient />
    </section>
  );
}
