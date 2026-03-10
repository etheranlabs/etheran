import { NextRequest, NextResponse } from 'next/server'
import { computeReputation } from '@/lib/reputation'

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase()

  try {
    const reputation = await computeReputation(address)

    if (!reputation) {
      return NextResponse.json(
        { error: 'Address not found in ERC-8183 provider registry' },
        { status: 404 }
      )
    }

    return NextResponse.json(reputation, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
