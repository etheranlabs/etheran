import { NextRequest, NextResponse } from 'next/server'
import { fetchAllJobs } from '@/lib/subgraph'

export async function GET(req: NextRequest) {
  try {
    const jobs = await fetchAllJobs(100)
    return NextResponse.json(jobs, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
