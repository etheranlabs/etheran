'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SubgraphProvider } from '@/lib/subgraph'
import { formatVolume, formatPercent } from '@/lib/format'

type SortKey = 'completion_rate' | 'total_volume' | 'avg_value' | 'last_active' | 'jobs_total'
type SortDir = 'asc' | 'desc'

interface ProviderTableProps {
  providers: SubgraphProvider[]
  dark?: boolean
}

function completionRate(p: SubgraphProvider): number {
  const total = p.jobsCompleted + p.jobsRejected + p.jobsExpired
  return total > 0 ? p.jobsCompleted / total : 0
}
function totalJobs(p: SubgraphProvider): number {
  return p.jobsCompleted + p.jobsRejected + p.jobsExpired
}
function avgJobValue(p: SubgraphProvider): number {
  const vol = Number(BigInt(p.totalVolume ?? '0')) / 1e18
  return p.jobsCompleted > 0 ? vol / p.jobsCompleted : 0
}
function totalVolume(p: SubgraphProvider): number {
  return Number(BigInt(p.totalVolume ?? '0')) / 1e18
}

export function ProviderTable({ providers, dark }: ProviderTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total_volume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...providers].sort((a, b) => {
    let av = 0, bv = 0
    switch (sortKey) {
      case 'completion_rate': av = completionRate(a); bv = completionRate(b); break
      case 'total_volume': av = totalVolume(a); bv = totalVolume(b); break
      case 'avg_value': av = avgJobValue(a); bv = avgJobValue(b); break
      case 'last_active': av = Number(a.lastJobAt ?? '0'); bv = Number(b.lastJobAt ?? '0'); break
      case 'jobs_total': av = totalJobs(a); bv = totalJobs(b); break
    }
    return sortDir === 'desc' ? bv - av : av - bv
  })

  const thClass = `font-mono text-[10px] uppercase tracking-[0.08em] cursor-pointer select-none hover:opacity-80 transition-opacity`

  return (
    <div>
      {/* Mobile: card list */}
      <div className="sm:hidden divide-y divide-border">
        {sorted.map((p) => {
          const rate = completionRate(p)
          const lastActive = p.lastJobAt
            ? new Date(Number(p.lastJobAt) * 1000).toLocaleDateString()
            : '—'
          return (
            <Link
              key={p.address}
              href={`/providers/${p.address}`}
              className={`block p-4 transition-colors ${dark ? 'hover:bg-[#1a1a18]' : 'hover:bg-bg-alt'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[11px] text-text">
                  {p.address.slice(0, 8)}...{p.address.slice(-6)}
                </p>
                <p className={`font-mono text-[10px] ${dark ? 'text-[#888884]' : 'text-text-muted'}`}>
                  {totalJobs(p)} jobs
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>
                    Completion
                  </p>
                  <p className="font-mono text-[11px] text-text">{formatPercent(rate * 100)}</p>
                  <div className="mt-1 h-0.5 bg-border rounded-none overflow-hidden">
                    <div className="h-full bg-text opacity-40" style={{ width: `${rate * 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>
                    Volume
                  </p>
                  <p className="font-mono text-[11px] text-text">{formatVolume(totalVolume(p))}</p>
                </div>
                <div>
                  <p className={`font-mono text-[9px] uppercase tracking-[0.06em] mb-0.5 ${dark ? 'text-[#444441]' : 'text-text-muted'}`}>
                    Last Active
                  </p>
                  <p className={`font-mono text-[11px] ${dark ? 'text-[#555552]' : 'text-text-muted'}`}>{lastActive}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className={dark ? 'table-dark' : ''}>
          <thead>
            <tr>
              <th className={thClass} onClick={() => handleSort('completion_rate')}>
                Completion Rate {sortKey === 'completion_rate' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th className={thClass} onClick={() => handleSort('total_volume')}>
                Volume {sortKey === 'total_volume' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th className={thClass} onClick={() => handleSort('avg_value')}>
                Avg Job Value {sortKey === 'avg_value' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th>Provider</th>
              <th className={thClass} onClick={() => handleSort('last_active')}>
                Last Active {sortKey === 'last_active' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th className={thClass} onClick={() => handleSort('jobs_total')}>
                Jobs {sortKey === 'jobs_total' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const rate = completionRate(p)
              const lastActive = p.lastJobAt
                ? new Date(Number(p.lastJobAt) * 1000).toLocaleDateString()
                : '—'
              return (
                <tr key={p.address}>
                  <td>
                    <Link href={`/providers/${p.address}`} className="contents">
                      <div className="flex items-center gap-2">
                        <span className={dark ? 'text-[#f7f7f3]' : 'text-text'}>
                          {formatPercent(rate * 100)}
                        </span>
                        <div className="h-1 bg-current opacity-20 rounded-none" style={{ width: `${rate * 60}px` }} />
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link href={`/providers/${p.address}`} className="hover:underline underline-offset-2">
                      {formatVolume(totalVolume(p))}
                    </Link>
                  </td>
                  <td>{formatVolume(avgJobValue(p))}</td>
                  <td>
                    <Link href={`/providers/${p.address}`} className="hover:underline underline-offset-2">
                      {p.address.slice(0, 10)}...{p.address.slice(-6)}
                    </Link>
                  </td>
                  <td className={dark ? 'text-[#555552]' : 'text-text-muted'}>{lastActive}</td>
                  <td className={dark ? 'text-[#888884]' : 'text-text-muted'}>{totalJobs(p)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
