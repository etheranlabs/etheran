import { getEvaluatorRegistry, EVALUATOR_SEED } from '@/lib/supabase'
import { EvaluatorRegistryClient } from './registry-client'

export const revalidate = 300

export const metadata = {
  title: 'Evaluator Registry — Etheran',
  description: 'On-chain evaluator performance derived from ERC-8183 activity.',
}

export default async function EvaluatorRegistryPage() {
  const evaluators = await getEvaluatorRegistry().catch(() => EVALUATOR_SEED)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Evaluator Registry
        </p>
        <h1 className="font-display font-light text-3xl sm:text-5xl text-text tracking-wide mb-3">
          Registry
        </h1>
        <p className="font-mono text-[11px] text-text-muted">
          On-chain evaluator performance derived from ERC-8183 activity.
        </p>
      </div>

      <EvaluatorRegistryClient evaluators={evaluators} />

      {/* Data provenance notice */}
      <div className="border border-border mt-8 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">Data note</p>
        <p className="font-mono text-[11px] text-text-muted leading-relaxed">
          Evaluator addresses and job counts are read directly from the ERC-8183 subgraph on Base — they reflect real on-chain activity.
          Domain specialization is not encoded in the ERC-8183 spec and is not available on-chain.
          The <span className="text-text">domain</span> column will remain blank until a self-reporting or enrichment mechanism is added.
          Registry grows automatically as ERC-8183 contracts record activity on Base.
        </p>
      </div>
    </div>
  )
}
