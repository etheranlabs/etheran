import { createPublicClient, http } from 'viem'
import { baseSepolia, base } from 'viem/chains'

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532')
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://sepolia.base.org'

const chain = chainId === 8453 ? base : baseSepolia

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
})

export async function resolveEns(address: string): Promise<string | null> {
  try {
    // ENS is only on mainnet — for Base Sepolia this will return null gracefully
    const name = await publicClient.getEnsName({
      address: address as `0x${string}`,
    })
    return name ?? null
  } catch {
    return null
  }
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatWei(wei: bigint | string | number, decimals = 18): string {
  const n = typeof wei === 'bigint' ? wei : BigInt(wei)
  const divisor = BigInt(10 ** decimals)
  const whole = n / divisor
  const remainder = n % divisor
  const decimal = remainder.toString().padStart(decimals, '0').slice(0, 4)
  return `${whole}.${decimal}`
}

export function basescanTx(hash: string): string {
  const base = chainId === 8453
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org'
  return `${base}/tx/${hash}`
}

export function basescanAddress(address: string): string {
  const base = chainId === 8453
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org'
  return `${base}/address/${address}`
}
