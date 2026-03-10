import { NextRequest, NextResponse } from 'next/server'
import { fetchAllProviders, fetchJobsByProvider } from '@/lib/subgraph'
import { computeReputation } from '@/lib/reputation'

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const address = params.address.toLowerCase()
    const [providers, jobs, reputation] = await Promise.all([
      fetchAllProviders(),
      fetchJobsByProvider(address),
      computeReputation(address),
    ])
    const provider = providers.find(p => p.address.toLowerCase() === address)
    if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ provider, jobs, reputation }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
