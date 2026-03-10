import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  JobCreated,
  JobFunded,
  JobSubmitted,
  JobCompleted,
  JobRejected,
  JobExpired,
} from '../generated/ERC8183/ERC8183'
import { Job, Provider, Evaluator, DailyStat } from '../generated/schema'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToDate(ts: BigInt): string {
  const secs = ts.toI32()
  const days = secs / 86400
  // Simple ISO date from unix epoch
  const epoch = 719163 + days // days since 0000-01-01
  const y400 = epoch / 146097
  let r = epoch % 146097
  const y100 = r / 36524
  r = r % 36524
  const y4 = r / 1461
  r = r % 1461
  const y1 = r / 365
  const year = y400 * 400 + y100 * 100 + y4 * 4 + y1 + 1
  const isLeap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
  let dayOfYear = r % 365 + 1
  const months = isLeap
    ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let month = 0
  for (let i = 0; i < 12; i++) {
    if (dayOfYear <= months[i]) {
      month = i + 1
      break
    }
    dayOfYear -= months[i]
  }
  const m = month < 10 ? '0' + month.toString() : month.toString()
  const d = dayOfYear < 10 ? '0' + dayOfYear.toString() : dayOfYear.toString()
  return year.toString() + '-' + m + '-' + d
}

function loadOrCreateProvider(address: Bytes, ts: BigInt): Provider {
  const id = address.toHex()
  let p = Provider.load(id)
  if (!p) {
    p = new Provider(id)
    p.address = address
    p.jobsCompleted = 0
    p.jobsRejected = 0
    p.jobsExpired = 0
    p.totalVolume = BigInt.fromI32(0)
    p.firstJobAt = ts
    p.lastJobAt = ts
  }
  return p
}

function loadOrCreateEvaluator(address: Bytes, ts: BigInt): Evaluator {
  const id = address.toHex()
  let e = Evaluator.load(id)
  if (!e) {
    e = new Evaluator(id)
    e.address = address
    e.evaluationsCompleted = 0
    e.evaluationsRejected = 0
    e.firstEvaluationAt = ts
    e.lastEvaluationAt = ts
  }
  return e
}

function loadOrCreateDailyStat(date: string): DailyStat {
  let d = DailyStat.load(date)
  if (!d) {
    d = new DailyStat(date)
    d.date = date
    d.jobsCreated = 0
    d.jobsCompleted = 0
    d.jobsRejected = 0
    d.jobsExpired = 0
    d.volumeSettled = BigInt.fromI32(0)
  }
  return d
}

// ─── Event handlers ───────────────────────────────────────────────────────────

export function handleJobCreated(event: JobCreated): void {
  const id = event.params.jobId.toString()
  let job = new Job(id)

  job.client = event.params.client
  job.provider = event.params.provider
  job.evaluator = event.params.evaluator
  job.value = event.params.value
  job.specHash = event.params.specHash
  job.deliverableHash = null
  job.status = 'open'
  job.createdAt = event.block.timestamp
  job.fundedAt = null
  job.submittedAt = null
  job.resolvedAt = null
  job.expiresAt = event.params.expiresAt
  job.blockNumber = event.block.number
  job.txHash = event.transaction.hash

  job.save()

  // Daily stat
  const date = timestampToDate(event.block.timestamp)
  const stat = loadOrCreateDailyStat(date)
  stat.jobsCreated = stat.jobsCreated + 1
  stat.save()
}

export function handleJobFunded(event: JobFunded): void {
  const id = event.params.jobId.toString()
  const job = Job.load(id)
  if (!job) return

  job.status = 'funded'
  job.fundedAt = event.block.timestamp
  job.save()
}

export function handleJobSubmitted(event: JobSubmitted): void {
  const id = event.params.jobId.toString()
  const job = Job.load(id)
  if (!job) return

  job.status = 'submitted'
  job.submittedAt = event.block.timestamp
  job.deliverableHash = event.params.deliverableHash
  job.save()
}

export function handleJobCompleted(event: JobCompleted): void {
  const id = event.params.jobId.toString()
  const job = Job.load(id)
  if (!job) return

  job.status = 'completed'
  job.resolvedAt = event.block.timestamp
  job.save()

  // Update provider
  const provider = loadOrCreateProvider(job.provider, event.block.timestamp)
  provider.jobsCompleted = provider.jobsCompleted + 1
  provider.totalVolume = provider.totalVolume.plus(job.value)
  provider.lastJobAt = event.block.timestamp
  provider.save()

  // Update evaluator
  const evaluator = loadOrCreateEvaluator(event.params.evaluator, event.block.timestamp)
  evaluator.evaluationsCompleted = evaluator.evaluationsCompleted + 1
  evaluator.lastEvaluationAt = event.block.timestamp
  evaluator.save()

  // Daily stat
  const date = timestampToDate(event.block.timestamp)
  const stat = loadOrCreateDailyStat(date)
  stat.jobsCompleted = stat.jobsCompleted + 1
  stat.volumeSettled = stat.volumeSettled.plus(job.value)
  stat.save()
}

export function handleJobRejected(event: JobRejected): void {
  const id = event.params.jobId.toString()
  const job = Job.load(id)
  if (!job) return

  job.status = 'rejected'
  job.resolvedAt = event.block.timestamp
  job.save()

  // Update provider
  const provider = loadOrCreateProvider(job.provider, event.block.timestamp)
  provider.jobsRejected = provider.jobsRejected + 1
  provider.lastJobAt = event.block.timestamp
  provider.save()

  // Update evaluator
  const evaluator = loadOrCreateEvaluator(event.params.evaluator, event.block.timestamp)
  evaluator.evaluationsRejected = evaluator.evaluationsRejected + 1
  evaluator.lastEvaluationAt = event.block.timestamp
  evaluator.save()

  // Daily stat
  const date = timestampToDate(event.block.timestamp)
  const stat = loadOrCreateDailyStat(date)
  stat.jobsRejected = stat.jobsRejected + 1
  stat.save()
}

export function handleJobExpired(event: JobExpired): void {
  const id = event.params.jobId.toString()
  const job = Job.load(id)
  if (!job) return

  job.status = 'expired'
  job.resolvedAt = event.block.timestamp
  job.save()

  // Update provider
  const provider = loadOrCreateProvider(job.provider, event.block.timestamp)
  provider.jobsExpired = provider.jobsExpired + 1
  provider.lastJobAt = event.block.timestamp
  provider.save()

  // Daily stat
  const date = timestampToDate(event.block.timestamp)
  const stat = loadOrCreateDailyStat(date)
  stat.jobsExpired = stat.jobsExpired + 1
  stat.save()
}
