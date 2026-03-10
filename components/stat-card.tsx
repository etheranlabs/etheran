interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  dark?: boolean
}

export function StatCard({ label, value, sub, dark }: StatCardProps) {
  const bg = dark ? 'bg-bg-alt border-border-dark' : 'bg-bg border-border'
  const labelColor = dark ? 'text-[#555552]' : 'text-text-muted'
  const valueColor = dark ? 'text-[#f7f7f3]' : 'text-text'
  const subColor = dark ? 'text-[#444441]' : 'text-text-muted'

  return (
    <div className={`border ${bg} p-4 sm:p-6`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.08em] ${labelColor} mb-3`}>
        {label}
      </p>
      <p className={`font-display font-light text-4xl sm:text-5xl leading-none ${valueColor}`}>
        {value}
      </p>
      {sub && (
        <p className={`font-mono text-[10px] mt-2 ${subColor}`}>{sub}</p>
      )}
    </div>
  )
}

// Skeleton loader for stat cards
export function StatCardSkeleton({ dark }: { dark?: boolean }) {
  const bg = dark ? 'bg-bg-alt border-border-dark' : 'bg-bg border-border'
  const shimmer = dark ? 'bg-[#1e1e1c]' : 'bg-[#e8e8e4]'

  return (
    <div className={`border ${bg} p-4 sm:p-6`}>
      <div className={`h-3 w-24 ${shimmer} mb-3 rounded`} />
      <div className={`h-12 w-32 ${shimmer} rounded`} />
    </div>
  )
}
