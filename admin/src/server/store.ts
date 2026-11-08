import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { StoredEvent } from '../shared/overview.js'

const MAX_EVENTS = 200_000
const DEDUPE_MS = 10_000

export type NewEvent = Omit<StoredEvent, 'eventHash'> & { eventHash: string | null }

export class EventStore {
  private events: StoredEvent[] = []
  private eventHashes = new Set<string>()
  private recent = new Map<string, number>()
  unreadableRows = 0
  truncated = false

  constructor(private readonly file: string) {}

  static open(file: string): EventStore {
    const store = new EventStore(file)
    if (!existsSync(file)) return store
    const lines = readFileSync(file, 'utf8').split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const parsed = JSON.parse(line) as StoredEvent
        if (!isStored(parsed)) {
          store.unreadableRows += 1
          continue
        }
        store.events.push(parsed)
        if (parsed.eventHash) store.eventHashes.add(parsed.eventHash)
      } catch {
        store.unreadableRows += 1
      }
    }
    if (store.events.length > MAX_EVENTS) {
      store.events.splice(0, store.events.length - MAX_EVENTS)
      store.truncated = true
    }
    return store
  }

  get all(): StoredEvent[] {
    return this.events
  }

  accept(event: NewEvent): 'stored' | 'duplicate' {
    if (event.eventHash && this.eventHashes.has(event.eventHash)) return 'duplicate'
    const recentKey = `${event.siteId}\0${event.path}\0${event.visitHash ?? ''}`
    const seenAt = this.recent.get(recentKey)
    const received = Date.parse(event.receivedAt)
    if (event.visitHash && seenAt !== undefined && received - seenAt < DEDUPE_MS) return 'duplicate'
    const stored: StoredEvent = event
    mkdirSync(dirname(this.file), { recursive: true })
    appendFileSync(this.file, `${JSON.stringify(stored)}\n`)
    this.events.push(stored)
    if (stored.eventHash) this.eventHashes.add(stored.eventHash)
    if (stored.visitHash) this.recent.set(recentKey, received)
    return 'stored'
  }
}

function isStored(value: unknown): value is StoredEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const event = value as Record<string, unknown>
  return (
    typeof event.siteId === 'string' &&
    typeof event.path === 'string' &&
    (event.referrerHost === null || typeof event.referrerHost === 'string') &&
    (event.visitHash === null || typeof event.visitHash === 'string') &&
    (event.visitorHash === null || typeof event.visitorHash === 'string') &&
    (event.eventHash === null || typeof event.eventHash === 'string') &&
    typeof event.day === 'string' &&
    typeof event.receivedAt === 'string'
  )
}

export function keyHash(salt: string, parts: string[]): string {
  const hash = createHash('sha256')
  hash.update(salt)
  for (const part of parts) {
    hash.update('\0')
    hash.update(part)
  }
  return hash.digest('hex')
}
