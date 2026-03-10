import { NextRequest, NextResponse } from 'next/server'
import { getJobs } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const status = searchParams.get('status') ?? undefined
  const provider = searchParams.get('provider') ?? undefined
  const evaluator = searchParams.get('evaluator') ?? undefined
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)
  const offset = Number(searchParams.get('offset') ?? 0)

  try {
    const jobs = await getJobs({ status, provider, evaluator, limit, offset })

    return NextResponse.json(
      { jobs, count: jobs.length, offset },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
