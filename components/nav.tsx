'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2">
    {/* Upper-left to center */}
    <line x1="3" y1="4" x2="14" y2="12" />
    {/* Lower-left to center */}
    <line x1="3" y1="20" x2="14" y2="12" />
    {/* Center to right */}
    <line x1="14" y1="12" x2="22" y2="12" />
  </svg>
)

const links = [
  { href: '/providers', label: 'Providers' },
  { href: '/evaluators', label: 'Evaluators' },
  { href: '/evaluators/registry', label: 'Registry' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/sync', label: 'Sync' },
  { href: '/getstarted', label: 'Docs' },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="border-b border-border bg-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text hover:opacity-70 transition-opacity"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span className="font-display text-base font-light tracking-[0.08em] uppercase">
            Etheran
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'font-mono text-[11px] tracking-[0.06em] uppercase transition-colors',
                isActive(link.href) ? 'text-text' : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          {/* Desktop Create Job button */}
          <Link
            href="/create"
            className="font-mono text-[10px] uppercase tracking-[0.06em] border border-text px-3 py-1.5 text-text hover:bg-text hover:text-bg transition-colors"
          >
            + Create Job
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="sm:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block h-px w-5 bg-current text-text-muted transition-all duration-200 origin-center ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block h-px w-5 bg-current text-text-muted transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-5 bg-current text-text-muted transition-all duration-200 origin-center ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-border bg-bg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={[
                'block px-6 py-4 font-mono text-[11px] tracking-[0.08em] uppercase border-b border-border transition-colors',
                isActive(link.href) ? 'text-text bg-bg-alt' : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile Create Job */}
          <Link
            href="/create"
            onClick={() => setOpen(false)}
            className="block px-6 py-4 font-mono text-[11px] tracking-[0.08em] uppercase text-text border-b border-border"
          >
            + Create Job
          </Link>
        </div>
      )}
    </nav>
  )
}
