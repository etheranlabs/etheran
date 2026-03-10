import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/nav'
import { Web3Providers } from '@/components/web3-providers'
import { Footer } from '@/components/footer'
import localFont from 'next/font/local'

const cormorant = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-cormorant',
  display: 'swap',
})

const jetbrains = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Etheran — On-chain Intelligence for ERC-8183',
  description:
    'Etheran indexes job activity from ERC-8183 smart contracts and surfaces real data: provider track records, evaluator performance, job pricing benchmarks, domain trends, and reputation feeds.',
  openGraph: {
    title: 'Etheran',
    description: 'On-chain intelligence for ERC-8183 agent commerce.',
    url: 'https://etheran.io',
    siteName: 'Etheran',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-text">
        <Web3Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  )
}
