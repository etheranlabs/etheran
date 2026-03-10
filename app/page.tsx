import { StatCard, StatCardSkeleton } from '@/components/stat-card'
import { JobTable } from '@/components/job-table'
import { getAnalyticsSummary, getJobs } from '@/lib/supabase'
import { formatVolume } from '@/lib/format'

export const revalidate = 60

async function getSummary() {
  try {
    return await getAnalyticsSummary()
  } catch {
    return null
  }
}

async function getRecentJobs() {
  try {
    return await getJobs({ limit: 10 })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [summary, recentJobs] = await Promise.all([getSummary(), getRecentJobs()])

  return (
    <div>
      {/* Banner */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 flex items-end justify-between gap-12">
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
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-px bg-border">
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
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>

          {/* Testnet notice */}
          <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[0.04em]">
            Testnet data. Base Sepolia. ERC-8183 mainnet deployment pending.
          </p>
        </div>
      </section>

      {/* ERC-8183 State Machine */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-10">
            What Etheran Reads
          </h2>

          {/* Horizontal timeline */}
          <div className="flex items-start gap-0 overflow-x-auto">
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
              <div key={step.state} className="flex items-start flex-1 min-w-[160px]">
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
      <section className="bg-bg-alt border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#444441] mb-8">
            About
          </h2>
          <p className="font-display font-light text-[clamp(20px,2.5vw,30px)] text-[#f7f7f3] leading-relaxed max-w-3xl">
            Etheran is an indexing and analytics layer for the ERC-8183 agent job economy. It reads
            on-chain events from ERC-8183 smart contracts deployed on Base, computes provider reputation
            scores from historical completion data, and exposes a read API for autonomous agents and
            tooling that need verifiable track records before assigning work.
          </p>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
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
