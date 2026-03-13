'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { EvaluatorRegistryEntry } from '@/lib/supabase'
import { relativeTime, formatPercent } from '@/lib/format'

type SortKey = 'evaluations_completed' | 'approval_rate' | 'avg_response_time_hours' | 'last_active'
type SortDir = 'asc' | 'desc'

interface Props {
  evaluators: EvaluatorRegistryEntry[]
}

export function EvaluatorRegistryClient({ evaluators }: Props) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('evaluations_completed')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return evaluators
      .filter(e => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false
        if (q) {
          return e.address.toLowerCase().includes(q) ||
            (e.domain ?? '').toLowerCase().includes(q)
        }
        return true
      })
      .map(e => {
        const total = e.evaluations_completed + e.evaluations_rejected
        const approval_rate = total > 0 ? (e.evaluations_completed / total) * 100 : 0
        return { ...e, approval_rate, total }
      })
      .sort((a, b) => {
        let av: number, bv: number
        if (sortKey === 'approval_rate') {
          av = a.approval_rate; bv = b.approval_rate
        } else if (sortKey === 'avg_response_time_hours') {
          av = a.avg_response_time_hours ?? 999; bv = b.avg_response_time_hours ?? 999
        } else if (sortKey === 'last_active') {
          av = new Date(a.last_active).getTime(); bv = new Date(b.last_active).getTime()
        } else {
          av = a.evaluations_completed; bv = b.evaluations_completed
        }
        return sortDir === 'asc' ? av - bv : bv - av
      })
  }, [evaluators, query, statusFilter, sortKey, sortDir])

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-text-muted ml-1">↕</span>
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const thClass = 'font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted text-left py-3 px-4 cursor-pointer select-none hover:text-text transition-colors whitespace-nowrap'
  const filterBase = 'font-mono text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors'
  const filterActive = 'text-text'
  const filterIdle = 'text-text-muted hover:text-text'

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="search by address or domain"
        className="w-full font-mono text-[12px] text-text placeholder:text-text-muted bg-bg border border-border px-4 py-2.5 focus:outline-none focus:border-text transition-colors mb-4"
      />

      {/* Filter row */}
      <div className="flex items-center gap-5 mb-6">
        <span
          className={`${filterBase} ${statusFilter === 'all' ? filterActive : filterIdle}`}
          onClick={() => setStatusFilter('all')}
        >All</span>
        <span
          className={`${filterBase} ${statusFilter === 'active' ? filterActive : filterIdle}`}
          onClick={() => setStatusFilter('active')}
        >Active</span>
        <span
          className={`${filterBase} ${statusFilter === 'inactive' ? filterActive : filterIdle}`}
          onClick={() => setStatusFilter('inactive')}
        >Inactive</span>
        <span className="font-mono text-[10px] text-text-muted ml-auto">{filtered.length} evaluator{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden divide-y divide-border border border-border">
        {filtered.map(ev => (
          <Link key={ev.address} href={`/evaluators/${ev.address}`} className="block p-4 hover:bg-border/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-[11px] text-text" title={ev.address}>
                {ev.address.slice(0, 10)}...{ev.address.slice(-6)}
              </span>
              <span className="font-mono text-[10px] text-text-muted">{ev.status}</span>
            </div>
            <p className="font-mono text-[10px] text-text-muted mb-2">{ev.domain ?? '—'}</p>
            <div className="flex gap-4">
              <span className="font-mono text-[10px] text-text-muted">{ev.evaluations_completed} evals</span>
              <span className="font-mono text-[10px] text-text-muted">{ev.approval_rate.toFixed(1)}% approval</span>
              <span className="font-mono text-[10px] text-text-muted">{ev.avg_response_time_hours != null ? `${ev.avg_response_time_hours.toFixed(1)}h` : '—'}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="font-mono text-[11px] text-text-muted p-6">no evaluators match.</p>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block border border-border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className={thClass}>Address</th>
              <th className={thClass}>Domain</th>
              <th className={`${thClass}`} onClick={() => handleSort('evaluations_completed')}>
                Evaluations <SortIndicator col="evaluations_completed" />
              </th>
              <th className={`${thClass}`} onClick={() => handleSort('approval_rate')}>
                Approval Rate <SortIndicator col="approval_rate" />
              </th>
              <th className={`${thClass}`} onClick={() => handleSort('avg_response_time_hours')}>
                Avg Response <SortIndicator col="avg_response_time_hours" />
              </th>
              <th className={`${thClass}`} onClick={() => handleSort('last_active')}>
                Last Active <SortIndicator col="last_active" />
              </th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ev => (
              <tr key={ev.address} className="border-b border-border last:border-b-0 hover:bg-border/20 transition-colors">
                <td className="py-3 px-4">
                  <Link
                    href={`/evaluators/${ev.address}`}
                    className="font-mono text-[11px] text-text hover:underline underline-offset-2"
                    title={ev.address}
                  >
                    {ev.address.slice(0, 10)}...{ev.address.slice(-6)}
                  </Link>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{ev.domain ?? '—'}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-text">{ev.evaluations_completed.toLocaleString()}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-text">{ev.approval_rate.toFixed(1)}%</td>
                <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                  {ev.avg_response_time_hours != null ? `${ev.avg_response_time_hours.toFixed(1)}h` : '—'}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                  {relativeTime(ev.last_active)}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{ev.status}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center font-mono text-[11px] text-text-muted">
                  no evaluators match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
