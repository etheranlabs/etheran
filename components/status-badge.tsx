interface StatusBadgeProps {
  status: string
  dark?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  open:      'text-[#888884] border-[#ddddd8]',
  funded:    'text-[#5a6a5e] border-[#c0d9c9]',
  submitted: 'text-[#5a5a8a] border-[#c5c5df]',
  completed: 'text-[#2d5a3d] border-[#a0c8b0]',
  rejected:  'text-[#8a3a2d] border-[#d4a09a]',
  expired:   'text-[#666660] border-[#ccccca]',
}

const STATUS_STYLES_DARK: Record<string, string> = {
  open:      'text-[#666663] border-[#2a2a28]',
  funded:    'text-[#4a7a5e] border-[#1e3028]',
  submitted: 'text-[#4a4a7a] border-[#1e1e30]',
  completed: 'text-[#3a8a50] border-[#1a3a25]',
  rejected:  'text-[#8a4a3a] border-[#3a1e1a]',
  expired:   'text-[#555552] border-[#222220]',
}

export function StatusBadge({ status, dark }: StatusBadgeProps) {
  const styles = dark
    ? STATUS_STYLES_DARK[status] ?? 'text-[#666663] border-[#2a2a28]'
    : STATUS_STYLES[status] ?? 'text-[#888884] border-[#ddddd8]'

  return (
    <span
      className={`inline-block font-mono text-[10px] uppercase tracking-[0.06em] border px-1.5 py-0.5 ${styles}`}
    >
      {status}
    </span>
  )
}
