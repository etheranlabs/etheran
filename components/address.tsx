import Link from 'next/link'

interface AddressProps {
  value: string
  href?: string
  short?: boolean
  chars?: number
  external?: boolean
}

function shorten(address: string, chars = 6): string {
  if (!address || address.length <= chars * 2 + 5) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function Address({ value, href, short = true, chars = 6, external }: AddressProps) {
  const display = short ? shorten(value, chars) : value

  const className =
    'font-mono text-xs tracking-tight hover:underline underline-offset-2 transition-colors'

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {display}
        </a>
      )
    }
    return (
      <Link href={href} className={className}>
        {display}
      </Link>
    )
  }

  return <span className="font-mono text-xs tracking-tight">{display}</span>
}
