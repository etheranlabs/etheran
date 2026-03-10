/**
 * Seed script — populates Supabase with realistic synthetic testnet data.
 * Run once when no live on-chain jobs exist yet.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// ─── Deterministic random helpers ─────────────────────────────────────────────

function rand(seed: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000
  return Math.floor((x - Math.floor(x)) * max)
}

function randFloat(seed: number, min: number, max: number): number {
  const x = Math.sin(seed + 7) * 10000
  const r = x - Math.floor(x)
  return min + r * (max - min)
}

function fakeAddress(seed: number): string {
  const hash = crypto.createHash('sha256').update(String(seed)).digest('hex')
  return '0x' + hash.slice(0, 40)
}

function fakeHash(seed: number): string {
  return '0x' + crypto.createHash('sha256').update('hash_' + seed).digest('hex')
}

function fakeTxHash(seed: number): string {
  return '0x' + crypto.createHash('sha256').update('tx_' + seed).digest('hex')
}

function fakeSpecHash(seed: number): string {
  return 'bafybeig' + crypto.createHash('sha256').update('spec_' + seed).digest('hex').slice(0, 46)
}

function fakeDeliverableHash(seed: number): string {
  return 'bafybeig' + crypto.createHash('sha256').update('del_' + seed).digest('hex').slice(0, 46)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function hoursAfter(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000)
}

// ─── Generate synthetic data ───────────────────────────────────────────────────

const PROVIDER_ADDRESSES = Array.from({ length: 8 }, (_, i) => fakeAddress(1000 + i))
const EVALUATOR_ADDRESSES = Array.from({ length: 3 }, (_, i) => fakeAddress(2000 + i))
const CLIENT_ADDRESSES = Array.from({ length: 10 }, (_, i) => fakeAddress(3000 + i))

const STATUSES = [
  'completed', 'completed', 'completed', 'completed', // weight towards completed
  'rejected',
  'expired',
  'submitted',
  'funded',
  'open',
]

interface SeedJob {
  id: string
  client: string
  provider: string
  evaluator: string
  value: number
  spec_hash: string
  deliverable_hash: string | null
  status: string
  created_at: string
  funded_at: string | null
  submitted_at: string | null
  resolved_at: string | null
  expires_at: string
  tx_hash: string
  block_number: number
}

function generateJobs(): SeedJob[] {
  const jobs: SeedJob[] = []

  for (let i = 0; i < 35; i++) {
    const createdDaysAgo = rand(i * 7, 90)
    const created = daysAgo(createdDaysAgo)
    const provider = PROVIDER_ADDRESSES[rand(i * 3, PROVIDER_ADDRESSES.length)]
    const client = CLIENT_ADDRESSES[rand(i * 5, CLIENT_ADDRESSES.length)]
    const evaluator = EVALUATOR_ADDRESSES[rand(i * 11, EVALUATOR_ADDRESSES.length)]
    const value = parseFloat(randFloat(i, 0.05, 2.5).toFixed(4))
    const status = STATUSES[rand(i * 13, STATUSES.length)]
    const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)

    const funded_at =
      status !== 'open' ? hoursAfter(created, rand(i, 12) + 1).toISOString() : null
    const submitted_at =
      ['submitted', 'completed', 'rejected'].includes(status)
        ? hoursAfter(new Date(funded_at!), rand(i, 48) + 2).toISOString()
        : null
    const resolved_at =
      ['completed', 'rejected', 'expired'].includes(status)
        ? hoursAfter(new Date(submitted_at ?? funded_at ?? created.toISOString()), rand(i, 24) + 1).toISOString()
        : null

    jobs.push({
      id: String(i + 1),
      client,
      provider,
      evaluator,
      value,
      spec_hash: fakeSpecHash(i),
      deliverable_hash:
        ['submitted', 'completed', 'rejected'].includes(status)
          ? fakeDeliverableHash(i)
          : null,
      status,
      created_at: created.toISOString(),
      funded_at,
      submitted_at,
      resolved_at,
      expires_at: expires.toISOString(),
      tx_hash: fakeTxHash(i),
      block_number: 5000000 + i * 100 + rand(i, 100),
    })
  }

  return jobs
}

function aggregateProviders(jobs: SeedJob[]) {
  const map: Record<
    string,
    {
      jobs_completed: number
      jobs_rejected: number
      jobs_expired: number
      total_volume: number
      first_seen: string
      last_active: string
    }
  > = {}

  for (const job of jobs) {
    if (!map[job.provider]) {
      map[job.provider] = {
        jobs_completed: 0,
        jobs_rejected: 0,
        jobs_expired: 0,
        total_volume: 0,
        first_seen: job.created_at,
        last_active: job.created_at,
      }
    }
    const p = map[job.provider]
    if (job.status === 'completed') {
      p.jobs_completed++
      p.total_volume += job.value
    } else if (job.status === 'rejected') {
      p.jobs_rejected++
    } else if (job.status === 'expired') {
      p.jobs_expired++
    }
    if (new Date(job.created_at) < new Date(p.first_seen)) {
      p.first_seen = job.created_at
    }
    if (new Date(job.created_at) > new Date(p.last_active)) {
      p.last_active = job.created_at
    }
  }

  return Object.entries(map).map(([address, stats]) => ({
    address,
    ...stats,
  }))
}

function aggregateEvaluators(jobs: SeedJob[]) {
  const map: Record<
    string,
    {
      evaluations_completed: number
      evaluations_rejected: number
      avg_response_time_hours: number
      first_seen: string
      last_active: string
      totalResponseMs: number
      responseCount: number
    }
  > = {}

  for (const job of jobs) {
    if (!['completed', 'rejected'].includes(job.status)) continue
    if (!map[job.evaluator]) {
      map[job.evaluator] = {
        evaluations_completed: 0,
        evaluations_rejected: 0,
        avg_response_time_hours: 0,
        first_seen: job.created_at,
        last_active: job.created_at,
        totalResponseMs: 0,
        responseCount: 0,
      }
    }
    const e = map[job.evaluator]
    if (job.status === 'completed') e.evaluations_completed++
    else e.evaluations_rejected++

    if (job.submitted_at && job.resolved_at) {
      const ms = new Date(job.resolved_at).getTime() - new Date(job.submitted_at).getTime()
      e.totalResponseMs += ms
      e.responseCount++
    }

    if (new Date(job.created_at) < new Date(e.first_seen)) {
      e.first_seen = job.created_at
    }
    if (new Date(job.created_at) > new Date(e.last_active)) {
      e.last_active = job.created_at
    }
  }

  return Object.entries(map).map(([address, stats]) => ({
    address,
    evaluations_completed: stats.evaluations_completed,
    evaluations_rejected: stats.evaluations_rejected,
    avg_response_time_hours:
      stats.responseCount > 0
        ? Math.round((stats.totalResponseMs / stats.responseCount / 3600000) * 10) / 10
        : null,
    first_seen: stats.first_seen,
    last_active: stats.last_active,
  }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating synthetic testnet data...')

  const jobs = generateJobs()
  const providers = aggregateProviders(jobs)
  const evaluators = aggregateEvaluators(jobs)

  console.log(`  ${jobs.length} jobs`)
  console.log(`  ${providers.length} providers`)
  console.log(`  ${evaluators.length} evaluators`)

  // Insert jobs
  console.log('\nInserting jobs...')
  const { error: jobError } = await supabase
    .from('jobs')
    .upsert(jobs, { onConflict: 'id' })
  if (jobError) {
    console.error('Error inserting jobs:', jobError.message)
    process.exit(1)
  }

  // Insert providers
  console.log('Inserting providers...')
  const { error: provError } = await supabase
    .from('providers')
    .upsert(providers, { onConflict: 'address' })
  if (provError) {
    console.error('Error inserting providers:', provError.message)
    process.exit(1)
  }

  // Insert evaluators
  console.log('Inserting evaluators...')
  const { error: evalError } = await supabase
    .from('evaluators')
    .upsert(evaluators, { onConflict: 'address' })
  if (evalError) {
    console.error('Error inserting evaluators:', evalError.message)
    process.exit(1)
  }

  console.log('\nSeed complete.')
  console.log(`  Jobs: ${jobs.filter((j) => j.status === 'completed').length} completed`)
  console.log(`  Total volume: ${jobs.filter((j) => j.status === 'completed').reduce((a, j) => a + j.value, 0).toFixed(4)} ETH`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
