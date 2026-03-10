import { fetchAllJobs, fetchAllProviders, fetchAllEvaluators } from '@/lib/subgraph'
import { VolumeChart, JobCountChart } from '@/components/charts/volume-chart'
import { CompletionChart } from '@/components/charts/completion-chart'
import { formatVolume, formatPercent } from '@/lib/format'

export const revalidate = 300

export const metadata = {
  title: 'Analytics — Etheran',
  description: 'Market intelligence for ERC-8183 job activity on Base.',
}

async function fetchData() {
  try {
    const [jobs, providers, evaluators] = await Promise.all([
      fetchAllJobs(1000),
      fetchAllProviders(),
      fetchAllEvaluators(),
    ])

    const totalJobs = jobs.length
    const totalVolumeWei = jobs.reduce((acc: bigint, j: any) => acc + BigInt(j.value ?? '0'), BigInt(0))
    const totalVolume = Number(totalVolumeWei) / 1e18
    const completedCount = jobs.filter((j: any) => j.status === 'completed').length
    const completionRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 1000) / 10 : 0
    const summary = { totalJobs, totalVolume, activeProviders: providers.length, completionRate }

    const byDay: Record<string, { count: number; volume: number; completed: number }> = {}
    for (const job of jobs) {
      const day = new Date(Number(job.createdAt) * 1000).toISOString().slice(0, 10)
      if (!byDay[day]) byDay[day] = { count: 0, volume: 0, completed: 0 }
      byDay[day].count++
      byDay[day].volume += Number(BigInt(job.value ?? '0')) / 1e18
      if (job.status === 'completed') byDay[day].completed++
    }
    const daily30 = Object.entries(byDay).sort().map(([date, d]) => ({ date, count: d.count, volume: d.volume }))
    const daily7 = daily30.slice(-7)
    const completionByDay = Object.entries(byDay).sort().map(([date, d]) => ({
      date,
      rate: d.count > 0 ? (d.completed / d.count) * 100 : 0,
    }))

    return { summary, daily30, daily7, completionByDay, providers, evaluators }
  } catch {
    return null
  }
}

export default async function AnalyticsPage() {
  const data = await fetchData()

  const evalCount = data?.evaluators.length ?? 0
  const avgEvalTime = evalCount > 0
    ? (data!.evaluators.reduce((acc, e) => acc + (e.avg_response_time_hours ?? 0), 0) / evalCount)
    : 0

  const totalEvals =
    data?.evaluators.reduce((acc, e) => acc + e.evaluations_completed + e.evaluations_rejected, 0) ?? 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Market Intelligence
        </p>
        <h1 className="font-display font-light text-5xl text-text tracking-wide">
          Analytics
        </h1>
        <p className="font-mono text-[11px] text-text-muted mt-4 max-w-xl leading-relaxed">
          Aggregate metrics derived from indexed ERC-8183 job events. Data refreshes every 5 minutes.
        </p>
      </div>

      {/* Summary row */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-12">
          {[
            { label: 'Total Jobs', value: data.summary.totalJobs.toLocaleString() },
            { label: 'Volume Settled', value: formatVolume(data.summary.totalVolume) },
            { label: 'Active Providers (30d)', value: data.summary.activeProviders.toLocaleString() },
            { label: 'Global Completion Rate', value: formatPercent(data.summary.completionRate) },
          ].map((s) => (
            <div key={s.label} className="bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">
                {s.label}
              </p>
              <p className="font-display font-light text-3xl text-text">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="space-y-12">
        {/* Job volume 30d */}
        <div className="border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
                Volume Settled (30d)
              </p>
              <p className="font-mono text-[10px] text-text-muted">
                ETH value of completed jobs per day
              </p>
            </div>
          </div>
          {data?.daily30 ? (
            <VolumeChart data={data.daily30} />
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="font-mono text-[11px] text-text-muted">No data.</p>
            </div>
          )}
        </div>

        {/* Job count 30d */}
        <div className="border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
                Job Count (30d)
              </p>
              <p className="font-mono text-[10px] text-text-muted">
                Total jobs created per day, all statuses
              </p>
            </div>
          </div>
          {data?.daily30 ? (
            <JobCountChart data={data.daily30} />
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="font-mono text-[11px] text-text-muted">No data.</p>
            </div>
          )}
        </div>

        {/* Evaluator stats */}
        <div className="border border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
            Evaluator Response Time Distribution
          </p>
          {data?.evaluators.length ? (
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="font-mono text-[10px] text-text-muted mb-2">Avg Response Time</p>
                <p className="font-display font-light text-4xl text-text">
                  {avgEvalTime.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-text-muted mb-2">Total Evaluators</p>
                <p className="font-display font-light text-4xl text-text">
                  {data.evaluators.length}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-text-muted mb-2">Total Evaluations</p>
                <p className="font-display font-light text-4xl text-text">
                  {totalEvals.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-text-muted">No evaluator data yet.</p>
          )}
        </div>

        {/* Provider distribution */}
        <div className="border border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-6">
            Provider Distribution
          </p>
          {data?.providers.length ? (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {data.providers.slice(0, 20).map((p, i) => {
                const total = p.jobsCompleted + p.jobsRejected + p.jobsExpired
                const maxTotal = data.providers[0]
                  ? data.providers[0].jobs_completed +
                    data.providers[0].jobs_rejected +
                    data.providers[0].jobs_expired
                  : 1
                const pct = total / maxTotal

                return (
                  <div key={p.address} className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-text-muted w-4 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted w-36 shrink-0 truncate">
                      {p.address.slice(0, 10)}...{p.address.slice(-4)}
                    </span>
                    <div className="flex-1 h-px bg-border relative">
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-text opacity-30"
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted w-8 text-right">
                      {total}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="font-mono text-[11px] text-text-muted">No provider data yet.</p>
          )}
        </div>
      </div>

      <p className="font-mono text-[10px] text-text-muted mt-8 tracking-[0.04em]">
        Testnet data. Base Sepolia. Refreshes every 5 minutes.
      </p>
    </div>
  )
}
