import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Data is served directly from The Graph subgraph, no indexing needed
  return NextResponse.json({ ok: true, message: 'Subgraph handles indexing automatically' })
}
