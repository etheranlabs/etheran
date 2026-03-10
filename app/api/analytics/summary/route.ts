import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsSummary } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  try {
    const summary = await getAnalyticsSummary()

    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
