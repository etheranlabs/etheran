import { fetchAllJobs, type SubgraphJob } from '@/lib/subgraph'
import { JobTable } from '@/components/job-table'

export const revalidate = 30

export const metadata = {
  title: 'Job Feed — Etheran',
  description: 'Live feed of ERC-8183 jobs indexed by Etheran.',
}

export default async function JobsPage() {
  let jobs: SubgraphJob[] = []
  try {
    jobs = await fetchAllJobs(100)
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-6 sm:pb-8 sm:mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Live Feed
        </p>
        <h1 className="font-display font-light text-3xl sm:text-5xl text-text tracking-wide">
          Job Activity
        </h1>
        <p className="font-mono text-[11px] text-text-muted mt-4 max-w-xl leading-relaxed">
          All ERC-8183 jobs indexed from Base Sepolia. Updates every 60 seconds via
          on-chain event indexing.
        </p>
      </div>

      {/* Count */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
            Showing
          </p>
          <p className="font-display font-light text-3xl text-text">
            {jobs.length.toLocaleString()}
          </p>
        </div>
        <p className="font-mono text-[10px] text-text-muted self-end pb-1">
          of most recent jobs
        </p>
      </div>

      <div className="border border-border p-4">
        <JobTable jobs={jobs} showFilter />
      </div>

      <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[0.04em]">
        Testnet data. Base Sepolia.
      </p>
    </div>
  )
}
