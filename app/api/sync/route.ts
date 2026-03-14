import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getERC8004Score, pushScoreToERC8004, deriveSyncStatus } from '@/lib/erc8004'

export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: providers, error } = await supabase
    .from('providers')
    .select('address, reputation_score')
    .not('reputation_score', 'is', null)
    .order('reputation_score', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let synced = 0, skipped = 0, failed = 0
  const BATCH = 10
  const DELAY = 500

  for (let i = 0; i < (providers ?? []).length; i += BATCH) {
    const batch = (providers ?? []).slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (provider) => {
        try {
          const onChainScore = await getERC8004Score(provider.address)
          const diff = Math.abs(provider.reputation_score - onChainScore)

          if (diff <= 5) {
            skipped++
            await supabase.from('reputation_sync').upsert({
              address: provider.address,
              etheran_score: provider.reputation_score,
              erc8004_score: onChainScore,
              last_synced_at: new Date().toISOString(),
              status: 'synced',
            })
            return
          }

          const hash = await pushScoreToERC8004(provider.address, provider.reputation_score)

          await supabase.from('reputation_sync').upsert({
            address: provider.address,
            etheran_score: provider.reputation_score,
            erc8004_score: provider.reputation_score,
            last_synced_at: new Date().toISOString(),
            status: 'synced',
            tx_hash: hash,
          })

          synced++
        } catch (e) {
          failed++
          await supabase.from('reputation_sync').upsert({
            address: provider.address,
            etheran_score: provider.reputation_score,
            last_synced_at: new Date().toISOString(),
            status: 'failed',
          })
        }
      })
    )

    // Rate limit delay between batches
    if (i + BATCH < (providers ?? []).length) {
      await new Promise((r) => setTimeout(r, DELAY))
    }
  }

  return NextResponse.json({
    synced,
    skipped,
    failed,
    total: (providers ?? []).length,
    timestamp: new Date().toISOString(),
  })
}
