import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://mainnet.base.org'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
})

export async function resolveEns(address: string): Promise<string | null> {
  try {
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
  return `https://basescan.org/tx/${hash}`
}

export function basescanAddress(address: string): string {
  return `https://basescan.org/address/${address}`
}
