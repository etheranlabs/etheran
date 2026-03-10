import { supabase } from './supabase'

export interface ReputationScore {
  address: string
  score: number
  completionRate: number
  volumeScore: number
  recencyScore: number
  breakdown: {
    completionWeight: number
    volumeWeight: number
    recencyWeight: number
  }
}

/**
 * Compute reputation score 0–100 for a given address.
 *
 * score = (completionRate * 60) + (log(volume + 1) / log(maxVolume + 1) * 25) + (recencyFactor * 15)
 * recencyFactor = jobs in last 30d > 0 ? 1 : (days since last job < 90 ? 0.5 : 0)
 */
export async function computeReputation(
  address: string
): Promise<ReputationScore | null> {
  const addr = address.toLowerCase()

  // Fetch provider data
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('address', addr)
    .single()

  if (!provider) return null

  // Fetch max volume across all providers for normalization
  const { data: topProvider } = await supabase
    .from('providers')
    .select('total_volume')
    .order('total_volume', { ascending: false })
    .limit(1)
    .single()

  const maxVolume = topProvider?.total_volume ?? 1

  const total =
    provider.jobs_completed + provider.jobs_rejected + provider.jobs_expired
  const completionRate = total > 0 ? provider.jobs_completed / total : 0

  // Log-normalized volume score
  const volume = provider.total_volume ?? 0
  const volumeNorm =
    Math.log(volume + 1) / Math.log(maxVolume + 1)

  // Recency factor
  let recencyFactor = 0
  if (provider.last_active) {
    const lastActive = new Date(provider.last_active).getTime()
    const now = Date.now()
    const daysSince = (now - lastActive) / (1000 * 60 * 60 * 24)

    // Check jobs in last 30d
    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('provider', addr)
      .gte(
        'created_at',
        new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
      )

    if ((count ?? 0) > 0) {
      recencyFactor = 1
    } else if (daysSince < 90) {
      recencyFactor = 0.5
    } else {
      recencyFactor = 0
    }
  }

  const completionWeight = completionRate * 60
  const volumeWeight = volumeNorm * 25
  const recencyWeight = recencyFactor * 15

  const score = Math.round(completionWeight + volumeWeight + recencyWeight)

  return {
    address: addr,
    score: Math.min(100, Math.max(0, score)),
    completionRate: Math.round(completionRate * 1000) / 10,
    volumeScore: Math.round(volumeNorm * 1000) / 10,
    recencyScore: recencyFactor,
    breakdown: {
      completionWeight: Math.round(completionWeight * 10) / 10,
      volumeWeight: Math.round(volumeWeight * 10) / 10,
      recencyWeight: Math.round(recencyWeight * 10) / 10,
    },
  }
}
