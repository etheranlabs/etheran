import Link from 'next/link'

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 52 52" fill="none" aria-hidden>
    <polyline
      points="10,10 32,26 10,42"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line
      x1="32"
      y1="26"
      x2="44"
      y2="26"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5 text-text-muted">
          <Logo />
          <span className="font-display text-sm font-light tracking-[0.08em] uppercase">
            Etheran
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/skill.md"
            className="font-mono text-[10px] text-text-muted hover:text-text tracking-[0.06em] uppercase transition-colors"
          >
            etheran.io/skill.md
          </Link>
          <a
            href="https://github.com/etheran"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-text-muted hover:text-text tracking-[0.06em] uppercase transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/etheranio"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-text-muted hover:text-text tracking-[0.06em] uppercase transition-colors"
          >
            X / Twitter
          </a>
        </div>
      </div>
    </footer>
  )
}
