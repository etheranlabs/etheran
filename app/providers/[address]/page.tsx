import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchAllProviders, fetchJobsByProvider, type SubgraphProvider } from '@/lib/subgraph'
import { computeReputation } from '@/lib/reputation'
import { resolveEns, basescanAddress } from '@/lib/viem'
import { formatDate, relativeTime, formatVolume, formatEth, formatPercent } from '@/lib/format'
import { JobTable } from '@/components/job-table'
import { StatusBadge } from '@/components/status-badge'

export const revalidate = 60

interface Props {
  params: { address: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Provider ${params.address.slice(0, 10)}... — Etheran`,
  }
}

export default async function ProviderProfilePage({ params }: Props) {
  const address = params.address.toLowerCase()

  const [provider, reputation, jobs, ens] = await Promise.all([
    getProvider(address),
    computeReputation(address),
    getJobs({ provider: address, limit: 50 }),
    resolveEns(address),
  ])

  if (!provider) notFound()

  const total = provider.jobsCompleted + provider.jobsRejected + provider.jobsExpired
  const completionRate = total > 0 ? (provider.jobsCompleted / total) * 100 : 0
  const avgJobValue = provider.jobsCompleted > 0 ? totalVol / provider.jobsCompleted : 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/providers"
          className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
        >
          Providers
        </Link>
        <span className="font-mono text-[10px] text-border">/</span>
        <span className="font-mono text-[10px] text-text-muted">
          {address.slice(0, 10)}...{address.slice(-6)}
        </span>
      </div>

      {/* Header: address + reputation score */}
      <div className="border-b border-border pb-10 mb-10 flex items-start justify-between gap-8">
        <div>
          {ens && (
            <p className="font-mono text-[11px] text-text-muted mb-2">{ens}</p>
          )}
          <p className="font-mono text-[clamp(12px,1.5vw,16px)] text-text break-all leading-relaxed">
            {address}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a
              href={basescanAddress(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
            >
              Basescan →
            </a>
          </div>
        </div>

        {/* Reputation score */}
        <div className="text-right shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">
            Reputation Score
          </p>
          <p className="font-display font-light text-[80px] leading-none text-text">
            {reputation?.score ?? '—'}
          </p>
          <p className="font-mono text-[10px] text-text-muted mt-1">out of 100</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-12">
        {[
          {
            label: 'Completion Rate',
            value: formatPercent(completionRate),
          },
          {
            label: 'Total Volume',
            value: formatVolume(totalVol),
          },
          {
            label: 'Avg Job Value',
            value: formatVolume(avgJobValue),
          },
          {
            label: 'Jobs Total',
            value: total.toLocaleString(),
            sub: `${provider.jobsCompleted}c / ${provider.jobsRejected}r / ${provider.jobsExpired}e`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">
              {stat.label}
            </p>
            <p className="font-display font-light text-3xl text-text">{stat.value}</p>
            {stat.sub && (
              <p className="font-mono text-[10px] text-text-muted mt-1">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="flex items-center gap-8 mb-12">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            First Job
          </p>
          <p className="font-mono text-xs text-text">{formatDate(new Date(Number(provider.firstJobAt ?? '0') * 1000).toLocaleDateString())}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            Last Active
          </p>
          <p className="font-mono text-xs text-text">{formatDate(new Date(Number(provider.lastJobAt ?? '0') * 1000).toLocaleDateString())}</p>
        </div>
      </div>

      {/* Reputation breakdown */}
      {reputation && (
        <div className="border border-border p-6 mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
            Score Breakdown
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="font-mono text-[10px] text-text-muted mb-1">
                Completion (60%)
              </p>
              <p className="font-display font-light text-2xl text-text">
                {reputation.breakdown.completionWeight}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-text-muted mb-1">
                Volume (25%)
              </p>
              <p className="font-display font-light text-2xl text-text">
                {reputation.breakdown.volumeWeight}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-text-muted mb-1">
                Recency (15%)
              </p>
              <p className="font-display font-light text-2xl text-text">
                {reputation.breakdown.recencyWeight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            Job History
          </h2>
          <p className="font-mono text-[10px] text-text-muted">
            Showing {Math.min(jobs.length, 50)} most recent
          </p>
        </div>
        <div className="border border-border">
          <JobTable jobs={jobs} />
        </div>
      </div>
    </div>
  )
}
