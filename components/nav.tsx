'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 52 52" fill="none" aria-hidden>
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

const links = [
  { href: '/providers', label: 'Providers' },
  { href: '/evaluators', label: 'Evaluators' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/skill.md', label: 'skill.md', mono: true },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* Left: wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text hover:opacity-70 transition-opacity"
        >
          <Logo />
          <span className="font-display text-base font-light tracking-[0.08em] uppercase">
            Etheran
          </span>
        </Link>

        {/* Right: nav links */}
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'font-mono text-[11px] tracking-[0.06em] uppercase transition-colors',
                  active
                    ? 'text-text'
                    : 'text-text-muted hover:text-text',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
