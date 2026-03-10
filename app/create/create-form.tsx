'use client'

'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useConnect, useDisconnect } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import { baseSepolia } from 'wagmi/chains'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/wagmi-config'
import Link from 'next/link'

const KNOWN_PROVIDERS = [
  { address: '0x8cEa03a5854819DA5411d97E34de8231a4499E7D', label: 'Provider A (2 jobs)' },
  { address: '0xC6bc572cfbE7813559596124657dbfb266B22B15', label: 'Provider B (testnet)' },
]
const KNOWN_EVALUATORS = [
  { address: '0xe8Bab8f87e622E41Af25B6b1653328F0279B8C28', label: 'Evaluator A (3 evals)' },
  { address: '0x3333333333333333333333333333333333333333', label: 'Evaluator B (testnet)' },
]

export default function CreateJobPage() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address, chainId: baseSepolia.id })
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  const [provider, setProvider] = useState('')
  const [evaluator, setEvaluator] = useState('')
  const [specHash, setSpecHash] = useState('')
  const [valueEth, setValueEth] = useState('0.01')
  const [daysExpiry, setDaysExpiry] = useState('7')

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const wrongNetwork = isConnected && chain?.id !== baseSepolia.id
  const isValid = isAddress(provider) && isAddress(evaluator) && specHash.length > 0 && Number(valueEth) > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const expiresAt = BigInt(Math.floor(Date.now() / 1000) + Number(daysExpiry) * 24 * 3600)
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createJob',
      args: [provider as `0x${string}`, evaluator as `0x${string}`, specHash, expiresAt],
      value: parseEther(valueEth),
    })
  }

  const inputClass = 'w-full bg-bg border border-border px-3 py-2.5 font-mono text-[11px] text-text placeholder:text-text-muted focus:outline-none focus:border-text transition-colors'
  const labelClass = 'block font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1.5'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="border-b border-border pb-8 mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted mb-3">On-chain Action</p>
        <h1 className="font-display font-light text-3xl sm:text-5xl text-text tracking-wide mb-4">Create Job</h1>
        <p className="font-mono text-[11px] text-text-muted leading-relaxed">
          Post a new ERC-8183 job on Base Sepolia. The bounty is locked in escrow until the evaluator approves.
        </p>
      </div>

      {/* Wallet Connection */}
      <div className="border border-border p-5 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted mb-3">Wallet</p>
        {!isConnected ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-mono text-[11px] text-text-muted">Connect your wallet to post a job on-chain.</p>
            <button
              onClick={() => connect({ connector: connectors[0] })}
              disabled={isConnecting}
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] border border-text px-5 py-2.5 text-text hover:bg-text hover:text-bg transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-text">{address?.slice(0, 12)}...{address?.slice(-6)}</p>
              {balance && (
                <p className="font-mono text-[10px] text-text-muted mt-0.5">
                  {(Number(balance.value) / 1e18).toFixed(4)} ETH · Base Sepolia
                </p>
              )}
            </div>
            <button
              onClick={() => disconnect()}
              className="font-mono text-[10px] uppercase tracking-[0.06em] border border-border px-3 py-1.5 text-text-muted hover:text-text transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Wrong network */}
      {wrongNetwork && (
        <div className="border border-[#ff6b6b] p-4 mb-6">
          <p className="font-mono text-[11px] text-[#ff6b6b]">
            ⚠️ Switch to Base Sepolia (Chain ID 84532) in your wallet.
          </p>
        </div>
      )}

      {/* Success */}
      {isSuccess && txHash && (
        <div className="border border-[#4ade80] p-5 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[#4ade80] mb-2">✓ Job Created!</p>
          <p className="font-mono text-[11px] text-text-muted mb-3">
            Your job is live on Base Sepolia. It will appear on Etheran within ~60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors"
            >
              View tx on Basescan →
            </a>
            <Link href="/jobs" className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted hover:text-text transition-colors">
              View all jobs →
            </Link>
          </div>
        </div>
      )}

      {/* Form */}
      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider */}
          <div>
            <label className={labelClass}>Provider Address *</label>
            <input type="text" placeholder="0x..." value={provider} onChange={e => setProvider(e.target.value)} className={inputClass} />
            <div className="mt-2 flex flex-wrap gap-1">
              {KNOWN_PROVIDERS.map(p => (
                <button key={p.address} type="button" onClick={() => setProvider(p.address)}
                  className="font-mono text-[9px] uppercase tracking-[0.04em] px-2 py-1 border border-border text-text-muted hover:text-text hover:border-text transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
            {provider && !isAddress(provider) && <p className="font-mono text-[10px] text-[#ff6b6b] mt-1">Invalid address</p>}
          </div>

          {/* Evaluator */}
          <div>
            <label className={labelClass}>Evaluator Address *</label>
            <input type="text" placeholder="0x..." value={evaluator} onChange={e => setEvaluator(e.target.value)} className={inputClass} />
            <div className="mt-2 flex flex-wrap gap-1">
              {KNOWN_EVALUATORS.map(ev => (
                <button key={ev.address} type="button" onClick={() => setEvaluator(ev.address)}
                  className="font-mono text-[9px] uppercase tracking-[0.04em] px-2 py-1 border border-border text-text-muted hover:text-text hover:border-text transition-colors">
                  {ev.label}
                </button>
              ))}
            </div>
            {evaluator && !isAddress(evaluator) && <p className="font-mono text-[10px] text-[#ff6b6b] mt-1">Invalid address</p>}
          </div>

          {/* Spec Hash */}
          <div>
            <label className={labelClass}>Spec Hash *</label>
            <input type="text" placeholder="bafybei... or any task description" value={specHash} onChange={e => setSpecHash(e.target.value)} className={inputClass} />
            <p className="font-mono text-[9px] text-text-muted mt-1">IPFS CID or any string describing the task.</p>
          </div>

          {/* Value + Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bounty (ETH) *</label>
              <input type="number" step="0.001" min="0.001" value={valueEth} onChange={e => setValueEth(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expires In (days)</label>
              <input type="number" min="1" max="365" value={daysExpiry} onChange={e => setDaysExpiry(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Summary */}
          {isValid && (
            <div className="border border-border-dark bg-bg-alt p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted mb-3">Summary</p>
              <div className="space-y-1.5">
                {[
                  ['Provider', `${provider.slice(0,10)}...${provider.slice(-6)}`],
                  ['Evaluator', `${evaluator.slice(0,10)}...${evaluator.slice(-6)}`],
                  ['Bounty', `${valueEth} ETH`],
                  ['Expires', `${daysExpiry} days`],
                  ['Network', 'Base Sepolia'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-mono text-[10px] text-text-muted">{k}</span>
                    <span className="font-mono text-[10px] text-text">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="font-mono text-[10px] text-[#ff6b6b]">
              Error: {(error as any).shortMessage || error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!isConnected || !isValid || isPending || isConfirming || wrongNetwork}
            className="w-full border border-text px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text hover:bg-text hover:text-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {!isConnected ? 'Connect Wallet First'
              : isPending ? 'Confirm in Wallet...'
              : isConfirming ? 'Confirming on-chain...'
              : `Post Job · ${valueEth} ETH`}
          </button>

          <p className="font-mono text-[10px] text-text-muted text-center">
            New here?{' '}
            <Link href="/getstarted" className="text-text hover:underline underline-offset-2">Read the docs →</Link>
          </p>
        </form>
      )}
    </div>
  )
}
