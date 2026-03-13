import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvaluatorRegistry, EVALUATOR_SEED } from '@/lib/supabase'
import { fetchJobsByEvaluator } from '@/lib/subgraph'
import { resolveEns, basescanAddress } from '@/lib/viem'
import { relativeTime, formatDate, formatEth, formatPercent } from '@/lib/format'
import { JobTable } from '@/components/job-table'

export const revalidate = 300

interface Props {
  params: { address: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Evaluator ${params.address.slice(0, 10)}... — Etheran`,
  }
}

export default async function EvaluatorDetailPage({ params }: Props) {
  const address = params.address.toLowerCase()

  const [registry, jobs, ens] = await Promise.all([
    getEvaluatorRegistry().catch(() => EVALUATOR_SEED),
    fetchJobsByEvaluator(address).catch(() => []),
    resolveEns(address).catch(() => null),
  ])

  const ev = registry.find(e => e.address.toLowerCase() === address)
  if (!ev && jobs.length === 0) notFound()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const status = ev?.last_active && new Date(ev.last_active) > thirtyDaysAgo ? 'active' : 'inactive'
  const total = (ev?.evaluations_completed ?? 0) + (ev?.evaluations_rejected ?? 0)
  const approvalRate = total > 0 ? ((ev?.evaluations_completed ?? 0) / total) * 100 : 0

  // Paginate job history
  const PAGE_SIZE = 20
  const jobPage = jobs.slice(0, PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">
        <Link href="/evaluators" className="hover:text-text transition-colors">Evaluators</Link>
        <span>/</span>
        <Link href="/evaluators/registry" className="hover:text-text transition-colors">Registry</Link>
        <span>/</span>
        <span className="text-text">{address.slice(0, 10)}...</span>
      </div>

      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-2">
          Evaluator
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            {ens && (
              <p className="font-mono text-[13px] text-text mb-1">{ens}</p>
            )}
            <a
              href={basescanAddress(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] sm:text-[14px] text-text break-all hover:underline underline-offset-2"
            >
              {address}
            </a>
          </div>
          <p className="font-mono text-[11px] text-text-muted shrink-0">{status}</p>
        </div>
        {ev?.domain && (
          <p className="font-mono text-[11px] text-text-muted mt-2">{ev.domain}</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mb-10">
        {[
          { label: 'Total Evaluations', value: total.toLocaleString() },
          { label: 'Approval Rate', value: total > 0 ? `${approvalRate.toFixed(1)}%` : '—' },
          { label: 'Avg Response Time', value: ev?.avg_response_time_hours != null ? `${ev.avg_response_time_hours.toFixed(1)}h` : '—' },
          { label: 'First Active', value: ev?.first_seen ? formatDate(ev.first_seen) : '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-bg p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1.5">{stat.label}</p>
            <p className="font-display font-light text-2xl text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Job history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            Job History
          </h2>
          {jobs.length > PAGE_SIZE && (
            <p className="font-mono text-[10px] text-text-muted">
              showing {PAGE_SIZE} of {jobs.length}
            </p>
          )}
        </div>
        {jobs.length > 0 ? (
          <JobTable jobs={jobPage} />
        ) : (
          <p className="font-mono text-[11px] text-text-muted border border-border p-6">
            no job history indexed yet.
          </p>
        )}
      </div>

      <p className="font-mono text-[10px] text-text-muted mt-6 tracking-[0.04em]">
        testnet data — mainnet registry populates automatically from ERC-8183 activity
      </p>
    </div>
  )
}
