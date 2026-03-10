const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubgraphJob {
  id: string
  client: string
  provider: string
  evaluator: string
  value: string
  specHash: string
  deliverableHash: string | null
  status: string
  createdAt: string
  fundedAt: string | null
  submittedAt: string | null
  resolvedAt: string | null
  expiresAt: string
  blockNumber: string
  txHash: string
}

export interface SubgraphProvider {
  id: string
  address: string
  jobsCompleted: number
  jobsRejected: number
  jobsExpired: number
  totalVolume: string
  firstJobAt: string
  lastJobAt: string
}

export interface SubgraphEvaluator {
  id: string
  address: string
  evaluationsCompleted: number
  evaluationsRejected: number
  firstEvaluationAt: string
  lastEvaluationAt: string
}

// ─── Query helpers ────────────────────────────────────────────────────────────

async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error('NEXT_PUBLIC_SUBGRAPH_URL not configured')
  }

  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables }),
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Subgraph request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }

  return json.data as T
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchRecentJobs(limit = 100): Promise<SubgraphJob[]> {
  const data = await query<{ jobs: SubgraphJob[] }>(`
    query RecentJobs($limit: Int!) {
      jobs(first: $limit, orderBy: createdAt, orderDirection: desc) {
        id
        client
        provider
        evaluator
        value
        specHash
        deliverableHash
        status
        createdAt
        fundedAt
        submittedAt
        resolvedAt
        expiresAt
        blockNumber
        txHash
      }
    }
  `, { limit })
  return data.jobs
}

export async function fetchAllProviders(): Promise<SubgraphProvider[]> {
  const data = await query<{ providers: SubgraphProvider[] }>(`
    {
      providers(first: 1000, orderBy: totalVolume, orderDirection: desc) {
        id
        address
        jobsCompleted
        jobsRejected
        jobsExpired
        totalVolume
        firstJobAt
        lastJobAt
      }
    }
  `)
  return data.providers
}

export async function fetchAllEvaluators(): Promise<SubgraphEvaluator[]> {
  const data = await query<{ evaluators: SubgraphEvaluator[] }>(`
    {
      evaluators(first: 1000) {
        id
        address
        evaluationsCompleted
        evaluationsRejected
        firstEvaluationAt
        lastEvaluationAt
      }
    }
  `)
  return data.evaluators
}

export async function fetchJobsByProvider(address: string): Promise<SubgraphJob[]> {
  const data = await query<{ jobs: SubgraphJob[] }>(`
    query JobsByProvider($address: Bytes!) {
      jobs(first: 100, where: { provider: $address }, orderBy: createdAt, orderDirection: desc) {
        id
        client
        provider
        evaluator
        value
        specHash
        deliverableHash
        status
        createdAt
        fundedAt
        submittedAt
        resolvedAt
        expiresAt
        blockNumber
        txHash
      }
    }
  `, { address: address.toLowerCase() })
  return data.jobs
}

export async function fetchJob(id: string): Promise<SubgraphJob | null> {
  const data = await query<{ job: SubgraphJob | null }>(`
    query GetJob($id: ID!) {
      job(id: $id) {
        id
        client
        provider
        evaluator
        value
        specHash
        deliverableHash
        status
        createdAt
        fundedAt
        submittedAt
        resolvedAt
        expiresAt
        blockNumber
        txHash
      }
    }
  `, { id })
  return data.job
}

// Alias for convenience
export const fetchAllJobs = fetchRecentJobs

