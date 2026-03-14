import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

// ─── Clients ─────────────────────────────────────────────────────────────────
// Lazy-init so missing env vars don't crash at import time.

function getWalletClient() {
  const pk = process.env.SYNC_WALLET_PRIVATE_KEY
  const rpc = process.env.NEXT_PUBLIC_RPC_URL
  if (!pk || !rpc) throw new Error('SYNC_WALLET_PRIVATE_KEY and NEXT_PUBLIC_RPC_URL must be set')
  const account = privateKeyToAccount(pk as `0x${string}`)
  return createWalletClient({ account, chain: baseSepolia, transport: http(rpc) })
}

function getPublicClient() {
  const rpc = process.env.NEXT_PUBLIC_RPC_URL
  if (!rpc) throw new Error('NEXT_PUBLIC_RPC_URL must be set')
  return createPublicClient({ chain: baseSepolia, transport: http(rpc) })
}

function getContractAddress(): `0x${string}` {
  const addr = process.env.ERC8004_CONTRACT_ADDRESS
  if (!addr) throw new Error('ERC8004_CONTRACT_ADDRESS must be set')
  return addr as `0x${string}`
}

// ─── ABI — minimal subset ────────────────────────────────────────────────────

const ERC8004_ABI = [
  {
    name: 'setReputation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'score', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: 'score', type: 'uint256' }],
  },
] as const

// ─── Public read ─────────────────────────────────────────────────────────────

export async function getERC8004Score(address: string): Promise<number> {
  const publicClient = getPublicClient()
  try {
    const score = await publicClient.readContract({
      address: getContractAddress(),
      abi: ERC8004_ABI,
      functionName: 'getReputation',
      args: [address as `0x${string}`],
    })
    return Number(score)
  } catch {
    // Contract not deployed or address not registered — score is 0
    return 0
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────

export async function pushScoreToERC8004(
  address: string,
  score: number
): Promise<string> {
  const walletClient = getWalletClient()
  const hash = await walletClient.writeContract({
    address: getContractAddress(),
    abi: ERC8004_ABI,
    functionName: 'setReputation',
    args: [address as `0x${string}`, BigInt(Math.round(score))],
  })
  return hash
}

// ─── Status helper ───────────────────────────────────────────────────────────

export function deriveSyncStatus(
  etheranScore: number,
  onChainScore: number,
  lastSyncedAt: string | null
): 'synced' | 'pending' | 'diverged' {
  if (!lastSyncedAt) return 'pending'
  const diff = Math.abs(etheranScore - onChainScore)
  if (diff > 5) return 'diverged'
  return 'synced'
}
