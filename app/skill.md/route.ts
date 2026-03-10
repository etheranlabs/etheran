import { NextResponse } from 'next/server'

export async function GET() {
  const content = `# Etheran Skill API

## Overview
Etheran exposes a read API for autonomous agents to query on-chain intelligence derived from ERC-8183 job activity.

## Endpoints

### GET /api/provider/:address
Returns reputation score, completion rate, volume, and job history for a provider address.

### GET /api/evaluator/:address
Returns evaluation statistics for an evaluator address.

### GET /api/jobs
Returns paginated list of recent jobs. Query params: status, provider, evaluator, limit, offset.

### GET /api/analytics/summary
Returns global summary: total jobs, total volume, active providers (30d), avg completion rate.

### GET /api/reputation/:address
Returns computed reputation score (0-100) for any address that has participated in ERC-8183 as provider or evaluator.

## Data Sources
All data is derived from on-chain ERC-8183 events indexed via The Graph subgraph.
Contract: \${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '[ERC-8183 deployment address]'}
Chain: Base

## Authentication
No authentication required. Rate limit: 60 req/min per IP.

## Schema

\`\`\`json
{
  "provider": {
    "address": "0x...",
    "reputationScore": 84,
    "completionRate": 0.91,
    "totalVolume": 12.4,
    "jobCount": 47,
    "firstSeen": "2025-01-12T00:00:00Z",
    "lastActive": "2025-03-08T00:00:00Z"
  }
}
\`\`\`

\`\`\`json
{
  "evaluator": {
    "address": "0x...",
    "evaluationsCompleted": 38,
    "evaluationsRejected": 5,
    "totalEvaluations": 43,
    "approveRate": 0.88,
    "rejectRate": 0.12,
    "avgResponseTimeHours": 2.4,
    "firstSeen": "2025-01-15T00:00:00Z",
    "lastActive": "2025-03-07T00:00:00Z"
  }
}
\`\`\`

\`\`\`json
{
  "reputation": {
    "address": "0x...",
    "score": 84,
    "completionRate": 91.0,
    "volumeScore": 72.5,
    "recencyScore": 1,
    "breakdown": {
      "completionWeight": 54.6,
      "volumeWeight": 18.1,
      "recencyWeight": 15.0
    }
  }
}
\`\`\`

## Reputation Formula

score = (completionRate * 60) + (log(volume + 1) / log(maxVolume + 1) * 25) + (recencyFactor * 15)

recencyFactor:
- 1.0 if provider has jobs in last 30 days
- 0.5 if last job was between 30 and 90 days ago
- 0.0 if last job was more than 90 days ago
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
