'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SubgraphJob } from '@/lib/subgraph'
import { formatDate, relativeTime, formatEth } from '@/lib/format'
import { StatusBadge } from './status-badge'

const ALL_STATUSES = ['open', 'funded', 'submitted', 'completed', 'rejected', 'expired']

interface JobTableProps {
  jobs: SubgraphJob[]
  showFilter?: boolean
  dark?: boolean
}

export function JobTable({ jobs, showFilter = false, dark }: JobTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered =
    statusFilter === 'all' ? jobs : jobs.filter((j) => j.status === statusFilter)

  const btnBase = 'font-mono text-[10px] uppercase tracking-[0.06em] px-2.5 py-1 border transition-colors'
  const btnActive = dark
    ? 'border-[#444441] bg-[#1e1e1c] text-[#f7f7f3]'
    : 'border-text bg-text text-bg'
  const btnIdle = dark
    ? 'border-border-dark text-[#555552] hover:text-[#f7f7f3]'
    : 'border-border text-text-muted hover:text-text'

  return (
    <div>
      {showFilter && (
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`${btnBase} ${statusFilter === 'all' ? btnActive : btnIdle}`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`${btnBase} ${statusFilter === s ? btnActive : btnIdle}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Mobile: card list */}
      <div className="sm:hidden divide-y divide-border">
        {filtered.map((job) => (
          <div key={job.id} className={`p-4 ${dark ? 'bg-bg-alt' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <Link
                href={`/jobs/${job.id}`}
                className="font-mono text-[11px] text-text hover:underline underline-offset-2"
              >
                #{job.id.slice(0, 10)}
              </Link>
              <StatusBadge status={job.status} dark={dark} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              <div>
                <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>Provider</p>
                <Link
                  href={`/providers/${job.provider}`}
                  className="font-mono text-[10px] text-text hover:underline"
                >
                  {job.provider.slice(0, 6)}...{job.provider.slice(-4)}
                </Link>
              </div>
              <div>
                <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>Value</p>
                <p className="font-mono text-[10px] text-text">
                  {formatEth(Number(BigInt(job.value ?? '0')) / 1e18)}
                </p>
              </div>
              <div>
                <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>Client</p>
                <a
                  href={`https://sepolia.basescan.org/address/${job.client}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] text-text hover:underline"
                >
                  {job.client.slice(0, 6)}...{job.client.slice(-4)}
                </a>
              </div>
              <div>
                <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>Created</p>
                <p className={`font-mono text-[10px] ${dark ? 'text-[#555552]' : 'text-text-muted'}`}>
                  {relativeTime(new Date(Number(job.createdAt) * 1000).toISOString())}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={`p-8 text-center font-mono text-[11px] ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>
            No jobs found.
          </div>
        )}
      </div>

      {/* Desktop: full table */}
      <div className="hidden sm:block overflow-x-auto">
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
              <tr key={job.id} className="cursor-pointer">
                <td>
                  <Link href={`/jobs/${job.id}`} className="hover:underline underline-offset-2">
                    #{job.id.slice(0, 8)}
                  </Link>
                </td>
                <td><StatusBadge status={job.status} dark={dark} /></td>
                <td>
                  <a
                    href={`https://sepolia.basescan.org/address/${job.client}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:underline underline-offset-2"
                  >
                    {job.client.slice(0, 8)}...{job.client.slice(-4)}
                  </a>
                </td>
                <td>
                  <Link href={`/providers/${job.provider}`} className="hover:underline underline-offset-2">
                    {job.provider.slice(0, 8)}...{job.provider.slice(-4)}
                  </Link>
                </td>
                <td>{formatEth(Number(BigInt(job.value ?? '0')) / 1e18)}</td>
                <td>
                  {job.evaluator ? (
                    <a
                      href={`https://sepolia.basescan.org/address/${job.evaluator}`}
                      target="_blank" rel="noopener noreferrer"
                      className="hover:underline underline-offset-2"
                    >
                      {job.evaluator.slice(0, 8)}...{job.evaluator.slice(-4)}
                    </a>
                  ) : (
                    <span className={dark ? 'text-[#444441]' : 'text-text-muted'}>—</span>
                  )}
                </td>
                <td className={dark ? 'text-[#555552]' : 'text-text-muted'}>
                  {relativeTime(new Date(Number(job.createdAt) * 1000).toISOString())}
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
