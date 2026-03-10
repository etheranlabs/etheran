import { NextRequest, NextResponse } from 'next/server'
import { fetchAllEvaluators } from '@/lib/subgraph'

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const address = params.address.toLowerCase()
    const evaluators = await fetchAllEvaluators()
    const evaluator = evaluators.find(e => e.address.toLowerCase() === address)
    if (!evaluator) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(evaluator, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
