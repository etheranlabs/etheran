import { fetchAllProviders, type SubgraphProvider } from '@/lib/subgraph'
import { ProviderTable } from '@/components/provider-table'

export const revalidate = 60

export const metadata = {
  title: 'Provider Intelligence — Etheran',
  description: 'Provider track records ranked by completion rate, volume, and activity.',
}

async function fetchProviders(): Promise<SubgraphProvider[]> {
  try {
    return await fetchAllProviders()
  } catch {
    return []
  }
}

export default async function ProvidersPage() {
  const providers = await fetchProviders()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Intelligence Layer
        </p>
        <h1 className="font-display font-light text-5xl text-text tracking-wide">
          Provider Records
        </h1>
        <p className="font-mono text-[11px] text-text-muted mt-4 max-w-xl leading-relaxed">
          All addresses that have acted as a provider in at least one ERC-8183 job. Ranked by
          completion rate and total volume settled.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-8 mb-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            Total Providers
          </p>
          <p className="font-display font-light text-3xl text-text">
            {providers.length.toLocaleString()}
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            Avg Completion Rate
          </p>
          <p className="font-display font-light text-3xl text-text">
            {providers.length > 0
              ? Math.round(
                  (providers.reduce((acc, p) => {
                    const total = p.jobsCompleted + p.jobsRejected + p.jobsExpired
                    return acc + (total > 0 ? p.jobsCompleted / total : 0)
                  }, 0) /
                    providers.length) *
                    1000
                ) /
                  10 +
                '%'
              : '—'}
          </p>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="border border-border py-16 text-center">
          <p className="font-mono text-[11px] text-text-muted">No providers indexed yet.</p>
        </div>
      ) : (
        <div className="border border-border">
          <ProviderTable providers={providers} />
        </div>
      )}

      <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[0.04em]">
        Testnet data. Base Sepolia.
      </p>
    </div>
  )
}
