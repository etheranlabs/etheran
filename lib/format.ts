/**
 * Format utilities — ISO dates, relative time, ETH values.
 * No emoji, no decorative output.
 */

export function formatDate(iso: string): string {
  return iso.slice(0, 10) // YYYY-MM-DD
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export function formatEth(value: number | string, decimals = 4): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toFixed(decimals) + ' ETH'
}

export function formatVolume(value: number): string {
  if (value >= 1000) return (value / 1000).toFixed(2) + 'k ETH'
  return value.toFixed(4) + ' ETH'
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    open: 'Open',
    funded: 'Funded',
    submitted: 'Submitted',
    completed: 'Completed',
    rejected: 'Rejected',
    expired: 'Expired',
  }
  return map[status] ?? status
}
