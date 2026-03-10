import { NextRequest, NextResponse } from 'next/server'
import { getEvaluator } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase()

  try {
    const evaluator = await getEvaluator(address)

    if (!evaluator) {
      return NextResponse.json({ error: 'Evaluator not found' }, { status: 404 })
    }

    const total = evaluator.evaluations_completed + evaluator.evaluations_rejected

    return NextResponse.json(
      {
        address: evaluator.address,
        evaluationsCompleted: evaluator.evaluations_completed,
        evaluationsRejected: evaluator.evaluations_rejected,
        totalEvaluations: total,
        approveRate: total > 0 ? evaluator.evaluations_completed / total : null,
        rejectRate: total > 0 ? evaluator.evaluations_rejected / total : null,
        avgResponseTimeHours: evaluator.avg_response_time_hours,
        firstSeen: evaluator.first_seen,
        lastActive: evaluator.last_active,
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
