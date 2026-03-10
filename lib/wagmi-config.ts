import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const CONTRACT_ADDRESS = '0x25E78Fa7cD4D52Fa752D725f128ADDF2B73040e0' as const
export const CHAIN = baseSepolia

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
})

export const CONTRACT_ABI = [
  {
    name: 'createJob',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'specHash', type: 'string' },
      { name: 'expiresAt', type: 'uint256' },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    name: 'submitJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverableHash', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'completeJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'rejectJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getJob',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'client', type: 'address' },
          { name: 'provider', type: 'address' },
          { name: 'evaluator', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'specHash', type: 'string' },
          { name: 'deliverableHash', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'fundedAt', type: 'uint256' },
          { name: 'submittedAt', type: 'uint256' },
          { name: 'resolvedAt', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'nextJobId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
