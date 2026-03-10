import { getEvaluators } from '@/lib/supabase'
import { formatDate, formatPercent } from '@/lib/format'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: 'Evaluator Performance — Etheran',
  description: 'Evaluator addresses ranked by evaluation count, approve rate, and response time.',
}

export default async function EvaluatorsPage() {
  let evaluators: Awaited<ReturnType<typeof getEvaluators>> = []
  try {
    evaluators = await getEvaluators()
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Intelligence Layer
        </p>
        <h1 className="font-display font-light text-5xl text-text tracking-wide">
          Evaluator Performance
        </h1>
        <p className="font-mono text-[11px] text-text-muted mt-4 max-w-xl leading-relaxed">
          Addresses that have evaluated ERC-8183 jobs. Metrics derived from on-chain
          JobCompleted and JobRejected events attributed to each evaluator address.
        </p>
      </div>

      {evaluators.length === 0 ? (
        <div className="border border-border py-16 text-center">
          <p className="font-mono text-[11px] text-text-muted">No evaluators indexed yet.</p>
        </div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Evaluator</th>
                <th>Total Evaluations</th>
                <th>Approve Rate</th>
                <th>Reject Rate</th>
                <th>Avg Response Time</th>
                <th>First Seen</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {evaluators.map((ev) => {
                const total =
                  ev.evaluations_completed + ev.evaluations_rejected
                const approveRate =
                  total > 0
                    ? formatPercent((ev.evaluations_completed / total) * 100)
                    : '—'
                const rejectRate =
                  total > 0
                    ? formatPercent((ev.evaluations_rejected / total) * 100)
                    : '—'

                return (
                  <tr key={ev.address}>
                    <td>
                      <span className="font-mono text-xs">
                        {ev.address.slice(0, 10)}...{ev.address.slice(-6)}
                      </span>
                    </td>
                    <td>{total.toLocaleString()}</td>
                    <td>{approveRate}</td>
                    <td>{rejectRate}</td>
                    <td>
                      {ev.avg_response_time_hours != null
                        ? `${ev.avg_response_time_hours.toFixed(1)}h`
                        : '—'}
                    </td>
                    <td className="text-text-muted">{formatDate(ev.first_seen)}</td>
                    <td className="text-text-muted">{formatDate(ev.last_active)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[0.04em]">
        Testnet data. Base Sepolia.
      </p>
    </div>
  )
}
