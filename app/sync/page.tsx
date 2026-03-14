import Link from 'next/link'
import { getReputationSyncList, getSyncedCount } from '@/lib/supabase'
import { relativeTime } from '@/lib/format'

export const revalidate = 300

export const metadata = {
  title: 'ERC-8004 Sync — Etheran',
  description: 'Reputation scores derived from ERC-8183 activity, pushed to the ERC-8004 identity registry.',
}

export default async function SyncPage() {
  const [syncList, syncedCount] = await Promise.all([
    getReputationSyncList().catch(() => []),
    getSyncedCount().catch(() => 0),
  ])

  const pending = syncList.filter(s => s.status === 'pending' || !s.last_synced_at).length
  const lastSync = syncList
    .filter(s => s.last_synced_at)
    .sort((a, b) => new Date(b.last_synced_at!).getTime() - new Date(a.last_synced_at!).getTime())[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          ERC-8004 Sync
        </p>
        <h1 className="font-display font-light text-3xl sm:text-5xl text-text tracking-wide mb-3">
          Sync
        </h1>
        <p className="font-mono text-[11px] text-text-muted max-w-xl leading-relaxed">
          Reputation scores derived from ERC-8183 activity, pushed to the ERC-8004 identity registry.
          Commerce on 8183. Identity on 8004.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border mb-10">
        <div className="bg-bg p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1.5">
            Total Synced
          </p>
          <p className="font-display font-light text-3xl text-text">
            {syncedCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-bg p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1.5">
            Pending Sync
          </p>
          <p className="font-display font-light text-3xl text-text">
            {pending.toLocaleString()}
          </p>
        </div>
        <div className="bg-bg p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1.5">
            Last Sync
          </p>
          <p className="font-display font-light text-3xl text-text">
            {lastSync?.last_synced_at ? relativeTime(lastSync.last_synced_at) : '—'}
          </p>
        </div>
      </div>

      {/* Sync status table */}
      {syncList.length === 0 ? (
        <div className="border border-border p-8">
          <p className="font-mono text-[11px] text-text-muted">
            no sync records yet. sync runs hourly via /api/sync.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block border border-border overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Address', 'Etheran Score', 'ERC-8004 Score', 'Last Synced', 'Status'].map(h => (
                    <th key={h} className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted text-left py-3 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {syncList.map(row => (
                  <tr key={row.address} className="border-b border-border last:border-b-0 hover:bg-border/20 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/providers/${row.address}`}
                        className="font-mono text-[11px] text-text hover:underline underline-offset-2"
                        title={row.address}
                      >
                        {row.address.slice(0, 10)}...{row.address.slice(-6)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text">
                      {row.etheran_score != null ? Math.round(row.etheran_score) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text">
                      {row.erc8004_score != null ? Math.round(row.erc8004_score) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                      {row.last_synced_at ? relativeTime(row.last_synced_at) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                      {row.tx_hash ? (
                        <a
                          href={`https://sepolia.basescan.org/tx/${row.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-text transition-colors"
                        >
                          {row.status}↗
                        </a>
                      ) : (
                        row.status
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-border border border-border">
            {syncList.map(row => (
              <div key={row.address} className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <Link href={`/providers/${row.address}`} className="font-mono text-[11px] text-text">
                    {row.address.slice(0, 10)}...{row.address.slice(-6)}
                  </Link>
                  <span className="font-mono text-[10px] text-text-muted">{row.status}</span>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="font-mono text-[10px] text-text-muted">
                    etheran: {row.etheran_score != null ? Math.round(row.etheran_score) : '—'}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    on-chain: {row.erc8004_score != null ? Math.round(row.erc8004_score) : '—'}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {row.last_synced_at ? relativeTime(row.last_synced_at) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="font-mono text-[10px] text-text-muted mt-6 tracking-[0.04em]">
        sync interval: hourly · threshold: ±5 points · chain: base sepolia
      </p>
    </div>
  )
}
