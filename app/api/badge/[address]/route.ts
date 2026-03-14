import { NextResponse } from 'next/server'
import { getProviderByAddress } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const data = await getProviderByAddress(params.address.toLowerCase()).catch(() => null)

  const score = data?.reputation_score
    ? Math.round(data.reputation_score)
    : 0

  const total =
    (data?.jobs_completed ?? 0) +
    (data?.jobs_rejected ?? 0) +
    (data?.jobs_expired ?? 0)

  const rate =
    total > 0
      ? ((( data!.jobs_completed) / total) * 100).toFixed(1) + '%'
      : '—'

  const svg = `<svg width="320" height="88" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="88" fill="#f7f7f3" rx="6" stroke="#ddddd8" stroke-width="1"/>
  <line x1="108" y1="16" x2="108" y2="72" stroke="#e4e4de" stroke-width="1"/>
  <line x1="216" y1="16" x2="216" y2="72" stroke="#e4e4de" stroke-width="1"/>
  <polyline points="18,28 30,44 18,60" stroke="#111110" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="30" y1="44" x2="38" y2="44" stroke="#111110" stroke-width="2.2" stroke-linecap="round"/>
  <text x="48" y="40" font-family="Georgia, serif" font-size="12" font-weight="bold" letter-spacing="2" fill="#111110">ETHERAN</text>
  <text x="48" y="58" font-family="Courier New, monospace" font-size="8" letter-spacing="1.5" fill="#aaaaaa">VERIFIED · ERC-8183</text>
  <text x="128" y="34" font-family="Courier New, monospace" font-size="8" letter-spacing="2" fill="#aaaaaa">REPUTATION</text>
  <text x="122" y="62" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#111110">${score}</text>
  <text x="228" y="34" font-family="Courier New, monospace" font-size="8" letter-spacing="2" fill="#aaaaaa">COMPLETION</text>
  <text x="228" y="62" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#111110">${rate}</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
