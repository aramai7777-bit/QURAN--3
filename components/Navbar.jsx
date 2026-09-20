'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

const LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/surah', label: 'القراءة' },
  { href: '/reciters', label: 'القرّاء' },
  { href: '/assistant', label: 'المساعد الذكي' },
  { href: '/bookmarks', label: 'المحفوظات' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <Link href="/" className="brand">
          <svg className="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="40" height="40" rx="10" stroke="var(--gold)" strokeWidth="1.4" />
            <path d="M24 10 L30 24 L24 38 L18 24 Z" stroke="var(--gold-bright)" strokeWidth="1.4" />
            <circle cx="24" cy="24" r="4" fill="var(--gold)" />
          </svg>
          <span className="brand-text">
            <span className="ar">القرآن الكريم</span>
            <span className="en">QURAN 3</span>
          </span>
          <span className="brand-author">anas mohamed</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="icon-btn" aria-label="بحث" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <Link href="/settings" className="icon-btn" aria-label="الإعدادات">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {LINKS.slice(0, 4).map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
      </nav>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}
