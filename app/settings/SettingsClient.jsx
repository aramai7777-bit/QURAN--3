'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsClient() {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [reciters, setReciters] = useState([]);

  useEffect(() => {
    fetch('https://www.mp3quran.net/api/v3/reciters?language=ar')
      .then((r) => r.json())
      .then((d) => setReciters((d.reciters || []).filter((r) => r.moshaf?.length)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="settings-group">
        <h3>إعدادات القراءة</h3>
        <div className="settings-row">
          <label>حجم الخط</label>
          <select value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: e.target.value })}>
            <option value="small">صغير</option>
            <option value="medium">متوسط</option>
            <option value="large">كبير</option>
          </select>
        </div>
        <div className="settings-row">
          <label>تباعد الأسطر</label>
          <select value={settings.lineSpacing} onChange={(e) => updateSettings({ lineSpacing: e.target.value })}>
            <option value="compact">مضغوط</option>
            <option value="comfortable">مريح</option>
            <option value="relaxed">واسع</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h3>إعدادات الصوت</h3>
        <div className="settings-row">
          <label>القارئ الافتراضي</label>
          <select
            value={settings.reciterId || ''}
            onChange={(e) => updateSettings({ reciterId: Number(e.target.value) || null, moshafId: null })}
          >
            <option value="">بدون تحديد</option>
            {reciters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="settings-row">
          <label>سرعة التشغيل</label>
          <select value={settings.speed} onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}>
            {[0.75, 1, 1.25, 1.5, 2].map((r) => <option key={r} value={r}>{r}x</option>)}
          </select>
        </div>
        <div className="settings-row">
          <label>تشغيل تلقائي للسورة التالية</label>
          <button
            className={`toggle ${settings.autoplayNextSurah ? 'on' : ''}`}
            aria-pressed={settings.autoplayNextSurah}
            onClick={() => updateSettings({ autoplayNextSurah: !settings.autoplayNextSurah })}
          />
        </div>
        <div className="settings-row">
          <label>عدد مرات التكرار الافتراضي (وضع الحفظ)</label>
          <select value={settings.repeatCount} onChange={(e) => updateSettings({ repeatCount: Number(e.target.value) })}>
            {[1, 3, 5, 7, 10].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h3>عام</h3>
        <div className="settings-row">
          <label>الوضع الليلي</label>
          <button className={`toggle ${theme === 'dark' ? 'on' : ''}`} aria-pressed={theme === 'dark'} onClick={toggleTheme} />
        </div>
      </div>
    </div>
  );
}
