import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fetchRecentJobs, fetchAllProviders, fetchAllEvaluators } from '@/lib/subgraph'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await runIndexer()
    return NextResponse.json({ ok: true, ...results })
  } catch (err: any) {
    console.error('[indexer]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function runIndexer() {
  const [jobs, providers, evaluators] = await Promise.all([
    fetchRecentJobs(500),
    fetchAllProviders(),
    fetchAllEvaluators(),
  ])

  // Upsert jobs
  let jobsUpserted = 0
  if (jobs.length > 0) {
    const rows = jobs.map((j) => ({
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
      tx_hash: `0x${Buffer.from(j.txHash.slice(2), 'hex').toString('hex')}`,
      block_number: Number(j.blockNumber),
    }))

    const { error } = await supabase.from('jobs').upsert(rows, { onConflict: 'id' })
    if (error) throw error
    jobsUpserted = rows.length
  }

  // Upsert providers
  let providersUpserted = 0
  if (providers.length > 0) {
    const rows = providers.map((p) => ({
      address: p.address.toLowerCase(),
      jobs_completed: p.jobsCompleted,
      jobs_rejected: p.jobsRejected,
      jobs_expired: p.jobsExpired,
      total_volume: Number(p.totalVolume) / 1e18,
      first_seen: new Date(Number(p.firstJobAt) * 1000).toISOString(),
      last_active: new Date(Number(p.lastJobAt) * 1000).toISOString(),
    }))

    const { error } = await supabase
      .from('providers')
      .upsert(rows, { onConflict: 'address' })
    if (error) throw error
    providersUpserted = rows.length
  }

  // Upsert evaluators
  let evaluatorsUpserted = 0
  if (evaluators.length > 0) {
    const rows = evaluators.map((e) => ({
      address: e.address.toLowerCase(),
      evaluations_completed: e.evaluationsCompleted,
      evaluations_rejected: e.evaluationsRejected,
      first_seen: new Date(Number(e.firstEvaluationAt) * 1000).toISOString(),
      last_active: new Date(Number(e.lastEvaluationAt) * 1000).toISOString(),
    }))

    const { error } = await supabase
      .from('evaluators')
      .upsert(rows, { onConflict: 'address' })
    if (error) throw error
    evaluatorsUpserted = rows.length
  }

  return {
    jobsUpserted,
    providersUpserted,
    evaluatorsUpserted,
    indexedAt: new Date().toISOString(),
  }
}
