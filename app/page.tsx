import { StatCard, StatCardSkeleton } from '@/components/stat-card'
import { getSyncedCount } from '@/lib/supabase'
import { JobTable } from '@/components/job-table'
import { fetchAllJobs, fetchAllProviders, fetchAllEvaluators } from '@/lib/subgraph'
import { formatVolume } from '@/lib/format'

export const revalidate = 60

export default async function HomePage() {
  const [allJobs, allProviders, syncedCount] = await Promise.all([
    fetchAllJobs(1000).catch(() => []),
    fetchAllProviders().catch(() => []),
    getSyncedCount().catch(() => 0),
  ])

  const recentJobs = allJobs.slice(0, 10)
  const totalJobs = allJobs.length
  const totalVolumeWei = allJobs.reduce((acc: bigint, j: any) => acc + BigInt(j.value ?? '0'), BigInt(0))
  const totalVolume = Number(totalVolumeWei) / 1e18
  const completedJobs = allJobs.filter((j: any) => j.status === 'completed').length
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 1000) / 10 : 0
  const summary = { totalJobs, totalVolume, activeProviders: allProviders.length, completionRate }

  return (
    <div>
      {/* Banner */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <svg width="40" height="40" viewBox="0 0 52 52" fill="none" aria-hidden>
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
            </div>
            <h1
              className="font-display font-light text-[clamp(60px,9vw,120px)] leading-none tracking-[0.05em] text-text"
              style={{ letterSpacing: '0.1em' }}
            >
              Etheran
            </h1>
          </div>
          <div className="pb-3 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted leading-relaxed max-w-[280px]">
              On-chain intelligence for ERC-8183 agent commerce.
            </p>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-border">
            {summary ? (
              <>
                <StatCard
                  label="Total Jobs Indexed"
                  value={summary.totalJobs.toLocaleString()}
                  sub="all time, all statuses"
                />
                <StatCard
                  label="Volume Settled"
                  value={formatVolume(summary.totalVolume)}
                  sub="completed jobs only"
                />
                <StatCard
                  label="Active Providers"
                  value={summary.activeProviders.toLocaleString()}
                  sub="completed >= 1 job, last 30d"
                />
                <StatCard
                  label="Synced to ERC-8004"
                  value={syncedCount.toLocaleString()}
                  sub="reputation pushed on-chain"
                />
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>

          
        </div>
      </section>

      {/* ERC-8183 State Machine */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-8">
            What Etheran Reads
          </h2>

          {/* Horizontal timeline */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-0">
            {[
              {
                state: 'Open',
                event: 'JobCreated',
                desc: 'Job posted with spec hash, value, and assigned evaluator. Awaiting funding.',
              },
              {
                state: 'Funded',
                event: 'JobFunded',
                desc: 'Value locked in escrow. Provider may begin work.',
              },
              {
                state: 'Submitted',
                event: 'JobSubmitted',
                desc: 'Provider submits deliverable hash. Evaluator review begins.',
              },
              {
                state: 'Completed',
                event: 'JobCompleted',
                desc: 'Evaluator attests delivery. Escrow released to provider.',
              },
              {
                state: 'Rejected / Expired',
                event: 'JobRejected / JobExpired',
                desc: 'Evaluator rejects deliverable, or job passes expiry without submission.',
              },
            ].map((step, i, arr) => (
              <div key={step.state} className="flex items-start sm:flex-1 border-b sm:border-b-0 border-border last:border-b-0 py-5 sm:py-0 sm:pb-0">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] text-text-muted w-5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <p className="font-display text-xl font-light text-text mb-1">
                    {step.state}
                  </p>
                  <p className="font-mono text-[9px] text-text-muted uppercase tracking-[0.06em] mb-3">
                    {step.event}
                  </p>
                  <p className="font-mono text-[11px] text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="mt-3 shrink-0">
                    <div className="font-mono text-[14px] text-border">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-6 sm:mb-8">
            About
          </p>
          {/* Main description - original text, preserved */}
          <p className="font-mono text-[13px] sm:text-[15px] text-text leading-[1.8] max-w-2xl mb-10 sm:mb-14">
            Etheran is an indexing and analytics layer for the ERC-8183 agent job economy.
            It reads on-chain events from ERC-8183 smart contracts deployed on Base,
            computes provider reputation scores from historical completion data, and exposes
            a read API for autonomous agents and tooling that need verifiable track records
            before assigning work.
          </p>
          {/* 3 key points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:border-t sm:border-border">
            <div className="sm:border-r sm:border-border sm:pt-6 sm:pr-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted block mb-2">01</span>
              <p className="font-mono text-[11px] text-text leading-relaxed">Index on-chain events from ERC-8183 contracts in real time</p>
            </div>
            <div className="sm:border-r sm:border-border sm:pt-6 sm:px-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted block mb-2">02</span>
              <p className="font-mono text-[11px] text-text leading-relaxed">Compute provider reputation from historical completion data</p>
            </div>
            <div className="sm:pt-6 sm:pl-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted block mb-2">03</span>
              <p className="font-mono text-[11px] text-text leading-relaxed">Expose a read API for agents that need verifiable track records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
              Recent Job Activity
            </h2>
            <a
              href="/jobs"
              className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
            >
              View all →
            </a>
          </div>
          <JobTable jobs={recentJobs} />
        </div>
      </section>
    </div>
  )
}
