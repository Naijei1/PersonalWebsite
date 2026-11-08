import { createHash, timingSafeEqual } from 'node:crypto'

/** Case-sensitive. Google returns this address in lowercase. */
export const OWNER_EMAIL = 'nj277@cornell.edu'

export type AccessDecision =
  | { ok: true; email: typeof OWNER_EMAIL; name?: string }
  | { ok: false; reason: 'missing-claims' | 'unverified' | 'missing-email' | 'not-allowed' }

export function digestEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest()
  const right = createHash('sha256').update(b).digest()
  return timingSafeEqual(left, right)
}

export function decideAccess(claims: unknown): AccessDecision {
  if (!claims || typeof claims !== 'object' || Array.isArray(claims)) {
    return { ok: false, reason: 'missing-claims' }
  }
  const record = claims as Record<string, unknown>
  if (record.email_verified !== true) return { ok: false, reason: 'unverified' }
  if (typeof record.email !== 'string' || record.email.length === 0 || record.email.length > 320) {
    return { ok: false, reason: 'missing-email' }
  }
  if (!digestEqual(record.email, OWNER_EMAIL)) return { ok: false, reason: 'not-allowed' }
  const name = typeof record.name === 'string' ? record.name.trim().slice(0, 80) : undefined
  return { ok: true, email: OWNER_EMAIL, name: name || undefined }
}
