import './globals.css';
import './shell.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ChaptersProvider } from '@/context/ChaptersContext';
import { PlayerProvider } from '@/context/PlayerContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import PWARegister from '@/components/PWARegister';

export const metadata = {
  title: {
    default: 'Quran 3 — Read & Listen to the Holy Quran',
    template: '%s — Quran 3'
  },
  description: 'Listen, read and reflect on the Holy Quran with verified text and recitations from renowned reciters.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon.svg' },
  openGraph: {
    title: 'Quran 3 — Read & Listen to the Holy Quran',
    description: 'Listen, read and reflect on the Holy Quran with verified text and recitations from renowned reciters.',
    type: 'website',
    locale: 'ar_AR'
  }
};

export const viewport = {
  themeColor: '#081815',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ThemeProvider>
          <SettingsProvider>
            <ChaptersProvider>
              <PlayerProvider>
                <PWARegister />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <AudioPlayer />
              </PlayerProvider>
            </ChaptersProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
