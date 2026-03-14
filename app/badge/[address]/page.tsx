import Link from 'next/link'
import { getProviderByAddress } from '@/lib/supabase'
import { CopyButton } from '@/components/copy-button'

export const revalidate = 3600

interface Props {
  params: { address: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Reputation Badge — ${params.address.slice(0, 10)}... — Etheran`,
  }
}

function CodeSnippet({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <pre className="font-mono text-[11px] text-text bg-bg border border-border px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  )
}

export default async function BadgePage({ params }: Props) {
  const address = params.address.toLowerCase()
  const provider = await getProviderByAddress(address).catch(() => null)

  const BASE = 'https://etheran.io'
  const badgeUrl = `${BASE}/api/badge/${address}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">
        <Link href="/providers" className="hover:text-text transition-colors">Providers</Link>
        <span>/</span>
        <Link href={`/providers/${address}`} className="hover:text-text transition-colors">
          {address.slice(0, 10)}...
        </Link>
        <span>/</span>
        <span className="text-text">Badge</span>
      </div>

      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">
          Reputation Badge
        </p>
        <p className="font-mono text-[12px] text-text break-all">{address}</p>
        {!provider && (
          <p className="font-mono text-[10px] text-text-muted mt-2">
            address not indexed — badge shows defaults until on-chain activity is detected.
          </p>
        )}
      </div>

      {/* Live badge preview */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-4">
          Preview
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/badge/${address}`}
          width={320}
          height={88}
          alt="Etheran reputation badge"
        />
      </div>

      {/* Embed snippets */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-6">
          Embed this badge
        </p>

        <CodeSnippet
          label="HTML"
          value={`<img src="${badgeUrl}" width="320" height="88" alt="Etheran Reputation" />`}
        />
        <CodeSnippet
          label="Markdown"
          value={`![Etheran Reputation](${badgeUrl})`}
        />
        <CodeSnippet
          label="Direct URL"
          value={badgeUrl}
        />

        <p className="font-mono text-[10px] text-text-muted mt-4 tracking-[0.04em]">
          Updates every hour from on-chain ERC-8183 activity.
        </p>
      </div>
    </div>
  )
}
