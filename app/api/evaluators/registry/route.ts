import { NextResponse } from 'next/server'
import { getEvaluatorRegistry } from '@/lib/supabase'

export const revalidate = 300

export async function GET() {
  try {
    const data = await getEvaluatorRegistry()
    return NextResponse.json({ data, count: data.length })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch registry' }, { status: 500 })
  }
}
