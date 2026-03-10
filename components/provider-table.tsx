'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Provider } from '@/lib/supabase'
import { formatDate, formatVolume, formatPercent } from '@/lib/format'

type SortKey = 'completion_rate' | 'total_volume' | 'avg_value' | 'last_active' | 'jobs_30d'
type SortDir = 'asc' | 'desc'

interface ProviderTableProps {
  providers: Provider[]
  dark?: boolean
}

function completionRate(p: Provider): number {
  const total = p.jobs_completed + p.jobs_rejected + p.jobs_expired
  return total > 0 ? p.jobs_completed / total : 0
}

function avgJobValue(p: Provider): number {
  return p.jobs_completed > 0 ? p.total_volume / p.jobs_completed : 0
}

export function ProviderTable({ providers, dark }: ProviderTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total_volume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...providers].sort((a, b) => {
    let av = 0, bv = 0
    switch (sortKey) {
      case 'completion_rate':
        av = completionRate(a); bv = completionRate(b); break
      case 'total_volume':
        av = a.total_volume; bv = b.total_volume; break
      case 'avg_value':
        av = avgJobValue(a); bv = avgJobValue(b); break
      case 'last_active':
        av = new Date(a.last_active).getTime()
        bv = new Date(b.last_active).getTime()
        break
    }
    return sortDir === 'desc' ? bv - av : av - bv
  })

  const thClass = `font-mono text-[10px] uppercase tracking-[0.08em] cursor-pointer select-none hover:opacity-80 transition-opacity`
  const divider = dark ? 'border-border-dark' : 'border-border'

  return (
    <div className="overflow-x-auto">
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
            <th>Active Since</th>
            <th className={thClass} onClick={() => handleSort('last_active')}>
              Last Active {sortKey === 'last_active' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </th>
            <th>Jobs</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const rate = completionRate(p)
            const total = p.jobs_completed + p.jobs_rejected + p.jobs_expired
            return (
              <tr
                key={p.address}
                className="cursor-pointer"
                onClick={() => {}}
              >
                <td>
                  <Link
                    href={`/providers/${p.address}`}
                    className="contents"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <span className={dark ? 'text-[#f7f7f3]' : 'text-text'}>
                        {formatPercent(rate * 100)}
                      </span>
                      <div
                        className={`h-1 bg-current opacity-20 rounded-none`}
                        style={{ width: `${rate * 60}px` }}
                      />
                    </div>
                  </Link>
                </td>
                <td>
                  <Link href={`/providers/${p.address}`} className="hover:underline underline-offset-2">
                    {formatVolume(p.total_volume)}
                  </Link>
                </td>
                <td>{formatVolume(avgJobValue(p))}</td>
                <td>
                  <Link
                    href={`/providers/${p.address}`}
                    className="hover:underline underline-offset-2"
                  >
                    {p.address.slice(0, 10)}...{p.address.slice(-6)}
                  </Link>
                </td>
                <td className={dark ? 'text-[#555552]' : 'text-text-muted'}>
                  {formatDate(p.first_seen)}
                </td>
                <td className={dark ? 'text-[#555552]' : 'text-text-muted'}>
                  {formatDate(p.last_active)}
                </td>
                <td className={dark ? 'text-[#888884]' : 'text-text-muted'}>
                  {total}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
