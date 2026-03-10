import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchJob } from '@/lib/subgraph'
import { basescanTx, basescanAddress } from '@/lib/viem'
import { formatDate, relativeTime, formatEth } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'

export const revalidate = 60

interface Props {
  params: { jobId: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Job #${params.jobId.slice(0, 10)} — Etheran`,
  }
}

const STATES = ['open', 'funded', 'submitted', 'completed', 'rejected', 'expired']

function getStateIndex(status: string): number {
  if (status === 'completed') return 3
  if (status === 'rejected' || status === 'expired') return 4
  return STATES.indexOf(status)
}

export default async function JobDetailPage({ params }: Props) {
  const job = await fetchJob(params.jobId)
  if (!job) notFound()

  const stateIndex = getStateIndex(job.status)

  const timeline = [
    { label: 'Open', key: 'open', time: new Date(Number(job.createdAt) * 1000).toISOString() },
    { label: 'Funded', key: 'funded', time: job.fundedAt ? new Date(Number(job.fundedAt) * 1000).toISOString() : null },
    { label: 'Submitted', key: 'submitted', time: job.submittedAt ? new Date(Number(job.submittedAt) * 1000).toISOString() : null },
    {
      label: job.status === 'rejected' ? 'Rejected' : job.status === 'expired' ? 'Expired' : 'Completed',
      key: 'completed',
      time: job.resolvedAt ? new Date(Number(job.resolvedAt) * 1000).toISOString() : null,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/jobs"
          className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
        >
          Jobs
        </Link>
        <span className="font-mono text-[10px] text-border">/</span>
        <span className="font-mono text-[10px] text-text-muted">
          #{params.jobId.slice(0, 12)}
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-border pb-8 mb-10 flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="font-mono text-lg text-text">#{job.id}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="font-mono text-[11px] text-text-muted">
            Created {relativeTime(new Date(Number(job.createdAt) * 1000).toISOString())} — {formatDate(new Date(Number(job.createdAt) * 1000).toISOString())}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            Value
          </p>
          <p className="font-display font-light text-4xl text-text">
            {formatEth(Number(BigInt(job.value ?? '0')) / 1e18)}
          </p>
        </div>
      </div>

      {/* State machine visualization */}
      <div className="border border-border p-6 mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
          State Progression
        </p>
        <div className="flex items-center gap-0">
          {timeline.map((step, i) => {
            const isPast = i < stateIndex
            const isCurrent = i === stateIndex
            const isFuture = i > stateIndex

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex-1">
                  <div
                    className={[
                      'h-0.5 mb-3',
                      isPast || isCurrent ? 'bg-text' : 'bg-border',
                    ].join(' ')}
                  />
                  <p
                    className={[
                      'font-mono text-[10px] uppercase tracking-[0.06em]',
                      isCurrent ? 'text-text' : isPast ? 'text-text-muted' : 'text-border',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="font-mono text-[9px] text-text-muted mt-1">
                      {formatDate(step.time)}
                    </p>
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div className="font-mono text-[10px] text-border px-2 pb-5">
                    →
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Party details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-10">
        {[
          { label: 'Client', value: job.client, href: `/providers/${job.client}` },
          { label: 'Provider', value: job.provider, href: `/providers/${job.provider}` },
          { label: 'Evaluator', value: job.evaluator, href: null },
        ].map((party) => (
          <div key={party.label} className="bg-bg p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-3">
              {party.label}
            </p>
            {party.href ? (
              <Link
                href={party.href}
                className="font-mono text-xs text-text hover:underline underline-offset-2 break-all"
              >
                {party.value}
              </Link>
            ) : (
              <p className="font-mono text-xs text-text break-all">{party.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Hashes */}
      <div className="border border-border p-6 mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
          Hashes
        </p>
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[10px] text-text-muted mb-1">Spec Hash</p>
            <p className="font-mono text-xs text-text break-all">{job.specHash}</p>
          </div>
          {job.deliverableHash && (
            <div>
              <p className="font-mono text-[10px] text-text-muted mb-1">Deliverable Hash</p>
              <p className="font-mono text-xs text-text break-all">{job.deliverableHash}</p>
            </div>
          )}
          <div>
            <p className="font-mono text-[10px] text-text-muted mb-1">Transaction Hash</p>
            <a
              href={basescanTx(job.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-text hover:underline underline-offset-2 break-all"
            >
              {job.txHash}
            </a>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="border border-border p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
          Timestamps
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: 'Created', value: new Date(Number(job.createdAt) * 1000).toISOString() },
            { label: 'Funded', value: job.fundedAt ? new Date(Number(job.fundedAt) * 1000).toISOString() : null },
            { label: 'Submitted', value: job.submittedAt ? new Date(Number(job.submittedAt) * 1000).toISOString() : null },
            { label: 'Resolved', value: job.resolvedAt ? new Date(Number(job.resolvedAt) * 1000).toISOString() : null },
            { label: 'Expires', value: new Date(Number(job.expiresAt) * 1000).toISOString() },
          ]
            .filter((ts) => ts.value)
            .map((ts) => (
              <div key={ts.label}>
                <p className="font-mono text-[10px] text-text-muted mb-1">{ts.label}</p>
                <p className="font-mono text-xs text-text">{formatDate(ts.value!)}</p>
              </div>
            ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <p className="font-mono text-[10px] text-text-muted">
            Block {job.blockNumber.toLocaleString()}
          </p>
          <a
            href={basescanTx(job.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
          >
            View on Basescan →
          </a>
        </div>
      </div>
    </div>
  )
}
