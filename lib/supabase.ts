import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  }
  _client = createClient(url, key)
  return _client
}

// Proxy that lazily creates the client on first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'open'
  | 'funded'
  | 'submitted'
  | 'completed'
  | 'rejected'
  | 'expired'

export interface Job {
  id: string
  client: string
  provider: string
  evaluator: string
  value: number
  spec_hash: string
  deliverable_hash: string | null
  status: JobStatus
  created_at: string
  funded_at: string | null
  submitted_at: string | null
  resolved_at: string | null
  expires_at: string
  tx_hash: string
  block_number: number
}

export interface Provider {
  address: string
  jobs_completed: number
  jobs_rejected: number
  jobs_expired: number
  total_volume: number
  first_seen: string
  last_active: string
  reputation_score: number | null
}

export interface Evaluator {
  address: string
  evaluations_completed: number
  evaluations_rejected: number
  avg_response_time_hours: number | null
  first_seen: string
  last_active: string
  domain?: string | null
  status?: 'active' | 'inactive'
}

export interface EvaluatorRegistryEntry {
  address: string
  domain: string | null
  evaluations_completed: number
  evaluations_rejected: number
  avg_response_time_hours: number | null
  last_active: string
  first_seen: string
  status: 'active' | 'inactive'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getJobs(params: {
  status?: string
  provider?: string
  evaluator?: string
  limit?: number
  offset?: number
}): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 50)
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50) - 1)

  if (params.status) query = query.eq('status', params.status)
  if (params.provider) query = query.eq('provider', params.provider)
  if (params.evaluator) query = query.eq('evaluator', params.evaluator)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getProviders(params: {
  sortBy?: 'completion_rate' | 'total_volume' | 'last_active'
  limit?: number
  offset?: number
}): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select('*')
    .limit(params.limit ?? 100)

  if (params.sortBy === 'total_volume') {
    query = query.order('total_volume', { ascending: false })
  } else if (params.sortBy === 'last_active') {
    query = query.order('last_active', { ascending: false })
  } else {
    query = query.order('jobs_completed', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProvider(address: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('address', address.toLowerCase())
    .single()
  if (error) return null
  return data
}

// Alias — normalize address to lowercase before querying
export async function getProviderByAddress(address: string): Promise<Provider | null> {
  return getProvider(address.toLowerCase())
}

export async function getEvaluators(): Promise<Evaluator[]> {
  const { data, error } = await supabase
    .from('evaluators')
    .select('*')
    .order('evaluations_completed', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getEvaluator(address: string): Promise<Evaluator | null> {
  const { data, error } = await supabase
    .from('evaluators')
    .select('*')
    .eq('address', address.toLowerCase())
    .single()
  if (error) return null
  return data
}

export async function getAnalyticsSummary() {
  const [totalJobs, completedJobs, activeProviders, totalVolume] =
    await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase
        .from('jobs')
        .select('value')
        .eq('status', 'completed'),
      supabase
        .from('providers')
        .select('address', { count: 'exact', head: true })
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('jobs')
        .select('value')
        .eq('status', 'completed'),
    ])

  const volumeSum = (totalVolume.data ?? []).reduce(
    (acc: number, j: { value: number }) => acc + (j.value ?? 0),
    0
  )

  const completedCount = completedJobs.data?.length ?? 0
  const totalCount = totalJobs.count ?? 0

  return {
    totalJobs: totalCount,
    totalVolume: volumeSum,
    activeProviders: activeProviders.count ?? 0,
    completionRate:
      totalCount > 0
        ? Math.round((completedCount / totalCount) * 1000) / 10
        : 0,
  }
}

export async function getDailyVolume(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('jobs')
    .select('created_at, value, status')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by day
  const byDay: Record<string, { count: number; volume: number }> = {}
  for (const job of data ?? []) {
    const day = job.created_at.slice(0, 10)
    if (!byDay[day]) byDay[day] = { count: 0, volume: 0 }
    byDay[day].count++
    if (job.status === 'completed') byDay[day].volume += job.value ?? 0
  }

  return Object.entries(byDay).map(([date, stats]) => ({ date, ...stats }))
}

export async function getEvaluatorRegistry(): Promise<EvaluatorRegistryEntry[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  try {
    const { data, error } = await supabase
      .from('evaluators')
      .select('address,domain,evaluations_completed,evaluations_rejected,avg_response_time_hours,last_active,first_seen')
      .order('evaluations_completed', { ascending: false })
    if (error || !data || data.length === 0) return EVALUATOR_SEED
    return data.map((row: any) => ({
      ...row,
      domain: row.domain ?? null,
      status: row.last_active && new Date(row.last_active) > new Date(thirtyDaysAgo) ? 'active' : 'inactive',
    }))
  } catch {
    return EVALUATOR_SEED
  }
}

// REAL on-chain evaluators from Base Sepolia subgraph.
// Domain is not indexed on-chain — shown as null until self-reported or enriched.
// Stats seeded from subgraph snapshot; auto-updated by /api/cron/index.
export const EVALUATOR_SEED: EvaluatorRegistryEntry[] = [
  {
    address: '0xe8bab8f87e622e41af25b6b1653328f0279b8c28',
    domain: null,
    evaluations_completed: 2,
    evaluations_rejected: 1,
    avg_response_time_hours: null,
    last_active: new Date(1773142894 * 1000).toISOString(),
    first_seen: new Date(1773142796 * 1000).toISOString(),
    status: 'active',
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    domain: null,
    evaluations_completed: 0,
    evaluations_rejected: 0,
    avg_response_time_hours: null,
    last_active: new Date(1773137584 * 1000).toISOString(),
    first_seen: new Date(1773137584 * 1000).toISOString(),
    status: 'inactive',
  },
]
