import { NextRequest, NextResponse } from 'next/server'
import { getProvider, getJobs } from '@/lib/supabase'
import { computeReputation } from '@/lib/reputation'

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase()

  try {
    const [provider, reputation, jobs] = await Promise.all([
      getProvider(address),
      computeReputation(address),
      getJobs({ provider: address, limit: 20 }),
    ])

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const total = provider.jobs_completed + provider.jobs_rejected + provider.jobs_expired

    return NextResponse.json(
      {
        address: provider.address,
        reputationScore: reputation?.score ?? null,
        completionRate: total > 0 ? provider.jobs_completed / total : 0,
        totalVolume: provider.total_volume,
        jobCount: total,
        jobsCompleted: provider.jobs_completed,
        jobsRejected: provider.jobs_rejected,
        jobsExpired: provider.jobs_expired,
        firstSeen: provider.first_seen,
        lastActive: provider.last_active,
        recentJobs: jobs.slice(0, 5).map((j) => ({
          id: j.id,
          status: j.status,
          value: j.value,
          createdAt: j.created_at,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
