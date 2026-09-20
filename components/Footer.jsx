export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="ar arabic">القرآن الكريم — Quran 3</div>
          <div className="credit">Made by / Eng: Anas</div>
          <div className="credit">© {new Date().getFullYear()} Eng: Anas — All Rights Reserved</div>
        </div>
        <div className="footer-meta">
          <div>
            Quran text courtesy of the{' '}
            <a href="https://quran.com" target="_blank" rel="noopener noreferrer">Quran.com</a> API —
            recitations courtesy of{' '}
            <a href="https://www.mp3quran.net" target="_blank" rel="noopener noreferrer">mp3quran.net</a>
          </div>
          <div className="attribution">Please respect the data sources&apos; licensing and attribution terms.</div>
        </div>
      </div>
    </footer>
  );
}
