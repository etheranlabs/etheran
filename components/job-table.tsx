'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SubgraphJob } from '@/lib/subgraph'
import { formatDate, relativeTime, formatEth } from '@/lib/format'
import { StatusBadge } from './status-badge'

const ALL_STATUSES = ['open', 'funded', 'submitted', 'completed', 'rejected', 'expired']

interface JobTableProps {
  jobs: Job[]
  showFilter?: boolean
  dark?: boolean
}

export function JobTable({ jobs, showFilter = false, dark }: JobTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered =
    statusFilter === 'all' ? jobs : jobs.filter((j) => j.status === statusFilter)

  return (
    <div>
      {showFilter && (
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={[
              'font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-1 border transition-colors',
              statusFilter === 'all'
                ? dark
                  ? 'border-[#444441] bg-[#1e1e1c] text-[#f7f7f3]'
                  : 'border-text bg-text text-bg'
                : dark
                ? 'border-border-dark text-[#555552] hover:text-[#f7f7f3]'
                : 'border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-1 border transition-colors',
                statusFilter === s
                  ? dark
                    ? 'border-[#444441] bg-[#1e1e1c] text-[#f7f7f3]'
                    : 'border-text bg-text text-bg'
                  : dark
                  ? 'border-border-dark text-[#555552] hover:text-[#f7f7f3]'
                  : 'border-border text-text-muted hover:text-text',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={dark ? 'table-dark' : ''}>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Status</th>
              <th>Client</th>
              <th>Provider</th>
              <th>Value</th>
              <th>Evaluator</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="cursor-pointer"
              >
                <td>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    #{job.id.slice(0, 8)}
                  </Link>
                </td>
                <td>
                  <StatusBadge status={job.status} dark={dark} />
                </td>
                <td>
                  <Link
                    href={`/providers/${job.client}`}
                    className="hover:underline underline-offset-2"
                  >
                    {job.client.slice(0, 8)}...{job.client.slice(-4)}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/providers/${job.provider}`}
                    className="hover:underline underline-offset-2"
                  >
                    {job.provider.slice(0, 8)}...{job.provider.slice(-4)}
                  </Link>
                </td>
                <td>{formatEth(Number(BigInt(job.value ?? '0')) / 1e18)}</td>
                <td>
                  {job.evaluator ? (
                    <Link
                      href={`/evaluators`}
                      className="hover:underline underline-offset-2"
                    >
                      {job.evaluator.slice(0, 8)}...{job.evaluator.slice(-4)}
                    </Link>
                  ) : (
                    <span className={dark ? 'text-[#444441]' : 'text-text-muted'}>—</span>
                  )}
                </td>
                <td className={dark ? 'text-[#555552]' : 'text-text-muted'}>
                  {relativeTime(Number(job.createdAt) * 1000)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className={`text-center py-8 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
