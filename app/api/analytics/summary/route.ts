import { NextRequest, NextResponse } from 'next/server'
import { fetchAllJobs, fetchAllProviders, fetchAllEvaluators } from '@/lib/subgraph'

export const revalidate = 60

export async function GET(_req: NextRequest) {
  try {
    const [jobs, providers] = await Promise.all([
      fetchAllJobs(1000),
      fetchAllProviders(),
    ])

    const totalJobs = jobs.length
    const totalVolumeWei = jobs.reduce((acc, j) => acc + BigInt(j.value ?? '0'), BigInt(0))
    const totalVolume = Number(totalVolumeWei) / 1e18
    const completedJobs = jobs.filter(j => j.status === 'completed').length
    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 1000) / 10 : 0

    return NextResponse.json({
      totalJobs,
      totalVolume: Math.round(totalVolume * 1e4) / 1e4,
      activeProviders: providers.length,
      completionRate,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
