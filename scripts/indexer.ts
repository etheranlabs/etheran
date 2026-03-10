/**
 * Etheran Indexer — polls The Graph subgraph every 60 seconds and upserts data into Supabase.
 * Can also be triggered via /api/cron/index on Vercel.
 *
 * Usage (standalone):
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... NEXT_PUBLIC_SUBGRAPH_URL=... npx ts-node scripts/indexer.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL!
const POLL_INTERVAL = 60 * 1000 // 60s

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ─── GraphQL query ─────────────────────────────────────────────────────────────

async function querySubgraph<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables }),
  })
  if (!res.ok) throw new Error(`Subgraph HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ─── Index round ───────────────────────────────────────────────────────────────

async function indexRound() {
  const start = Date.now()

  const [jobsData, providersData, evaluatorsData] = await Promise.all([
    querySubgraph<{ jobs: any[] }>(`{
      jobs(first: 1000, orderBy: createdAt, orderDirection: desc) {
        id client provider evaluator value specHash deliverableHash status
        createdAt fundedAt submittedAt resolvedAt expiresAt blockNumber txHash
      }
    }`),
    querySubgraph<{ providers: any[] }>(`{
      providers(first: 1000) {
        id address jobsCompleted jobsRejected jobsExpired totalVolume firstJobAt lastJobAt
      }
    }`),
    querySubgraph<{ evaluators: any[] }>(`{
      evaluators(first: 1000) {
        id address evaluationsCompleted evaluationsRejected firstEvaluationAt lastEvaluationAt
      }
    }`),
  ])

  // Upsert jobs
  if (jobsData.jobs.length > 0) {
    const rows = jobsData.jobs.map((j: any) => ({
      id: j.id,
      client: j.client.toLowerCase(),
      provider: j.provider.toLowerCase(),
      evaluator: j.evaluator.toLowerCase(),
      value: Number(j.value) / 1e18,
      spec_hash: j.specHash,
      deliverable_hash: j.deliverableHash ?? null,
      status: j.status.toLowerCase(),
      created_at: new Date(Number(j.createdAt) * 1000).toISOString(),
      funded_at: j.fundedAt ? new Date(Number(j.fundedAt) * 1000).toISOString() : null,
      submitted_at: j.submittedAt ? new Date(Number(j.submittedAt) * 1000).toISOString() : null,
      resolved_at: j.resolvedAt ? new Date(Number(j.resolvedAt) * 1000).toISOString() : null,
      expires_at: new Date(Number(j.expiresAt) * 1000).toISOString(),
      tx_hash: j.txHash,
      block_number: Number(j.blockNumber),
    }))
    const { error } = await supabase.from('jobs').upsert(rows, { onConflict: 'id' })
    if (error) throw error
    console.log(`[indexer] upserted ${rows.length} jobs`)
  }

  // Upsert providers
  if (providersData.providers.length > 0) {
    const rows = providersData.providers.map((p: any) => ({
      address: p.address.toLowerCase(),
      jobs_completed: p.jobsCompleted,
      jobs_rejected: p.jobsRejected,
      jobs_expired: p.jobsExpired,
      total_volume: Number(p.totalVolume) / 1e18,
      first_seen: new Date(Number(p.firstJobAt) * 1000).toISOString(),
      last_active: new Date(Number(p.lastJobAt) * 1000).toISOString(),
    }))
    const { error } = await supabase.from('providers').upsert(rows, { onConflict: 'address' })
    if (error) throw error
    console.log(`[indexer] upserted ${rows.length} providers`)
  }

  // Upsert evaluators
  if (evaluatorsData.evaluators.length > 0) {
    const rows = evaluatorsData.evaluators.map((e: any) => ({
      address: e.address.toLowerCase(),
      evaluations_completed: e.evaluationsCompleted,
      evaluations_rejected: e.evaluationsRejected,
      first_seen: new Date(Number(e.firstEvaluationAt) * 1000).toISOString(),
      last_active: new Date(Number(e.lastEvaluationAt) * 1000).toISOString(),
    }))
    const { error } = await supabase.from('evaluators').upsert(rows, { onConflict: 'address' })
    if (error) throw error
    console.log(`[indexer] upserted ${rows.length} evaluators`)
  }

  const duration = Date.now() - start
  console.log(`[indexer] round complete in ${duration}ms`)
}

// ─── Main loop ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('[indexer] starting...')
  console.log(`[indexer] subgraph: ${SUBGRAPH_URL}`)
  console.log(`[indexer] poll interval: ${POLL_INTERVAL / 1000}s`)

  // Run immediately on start
  try {
    await indexRound()
  } catch (err: any) {
    console.error('[indexer] error:', err.message)
  }

  // Then on interval
  setInterval(async () => {
    try {
      await indexRound()
    } catch (err: any) {
      console.error('[indexer] error:', err.message)
    }
  }, POLL_INTERVAL)
}

main()
