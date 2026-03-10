# Etheran

On-chain intelligence for ERC-8183 agent commerce.

Etheran indexes job activity from ERC-8183 smart contracts and surfaces real data: provider track records, evaluator performance, job pricing benchmarks, domain trends, and reputation feeds for ERC-8004.

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (no component libraries)
- Cormorant Garamond (display) + JetBrains Mono (data)
- viem + wagmi v2 — on-chain reads from Base
- The Graph — ERC-8183 event indexing
- Supabase — data cache + reputation storage
- Vercel — deployment + cron jobs

## Setup

### 1. Clone and install

```bash
git clone https://github.com/[your-org]/etheran
cd etheran
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — from your Supabase project
- `NEXT_PUBLIC_SUBGRAPH_URL` — your deployed Graph subgraph endpoint
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — deployed ERC-8183 contract address
- `CRON_SECRET` — random secret for Vercel cron protection

### 3. Supabase schema

Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Seed testnet data (optional)

If no on-chain jobs exist yet:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node scripts/seed.ts
```

This inserts 35 synthetic testnet jobs. The UI labels all data as "Testnet data. Base Sepolia."

### 5. Deploy subgraph

```bash
cd subgraph
npm install -g @graphprotocol/graph-cli
graph init
graph deploy --studio etheran
```

Update `subgraph.yaml` with your contract address and start block.

### 6. Run locally

```bash
npm run dev
```

### 7. Deploy to Vercel

```bash
vercel deploy
```

Add env vars in Vercel project settings. The cron job at `vercel.json` runs `/api/cron/index` every minute.

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — live stats, state machine diagram, recent jobs |
| `/providers` | Provider leaderboard — sortable by completion rate, volume, activity |
| `/providers/[address]` | Provider profile — reputation score, job history, score breakdown |
| `/evaluators` | Evaluator performance table |
| `/jobs` | Live job feed — filterable by status |
| `/jobs/[jobId]` | Job detail — state progression, parties, hashes, timestamps |
| `/analytics` | Market charts — volume, job count, evaluator stats |
| `/skill.md` | Raw markdown skill API doc for autonomous agents |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/provider/[address]` | Provider stats + reputation |
| `GET /api/evaluator/[address]` | Evaluator stats |
| `GET /api/jobs` | Paginated job list (`?status=`, `?provider=`, `?limit=`, `?offset=`) |
| `GET /api/analytics/summary` | Global aggregate stats |
| `GET /api/reputation/[address]` | Computed reputation score (0–100) |
| `GET /api/cron/index` | Indexer trigger (Bearer `CRON_SECRET` required) |

## Reputation Formula

```
score = (completionRate * 60) + (log(volume + 1) / log(maxVolume + 1) * 25) + (recencyFactor * 15)

recencyFactor:
  1.0  — active in last 30 days
  0.5  — last active 30–90 days ago
  0.0  — last active > 90 days ago
```

---

## Design System

Black/off-white only. No gradients. No component libraries.

```
--bg: #f7f7f3
--bg-alt: #111110
--text: #111110
--text-muted: #888884
--border: #ddddd8
--accent: #132b1f
--accent-light: #d4ede4
```

Typography does the heavy lifting. Cormorant Garamond for display, JetBrains Mono for all data, addresses, and metrics.
