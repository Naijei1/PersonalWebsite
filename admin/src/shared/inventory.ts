export type Site = {
  id: string
  label: string
  short: string
  color: string
  hosts: readonly string[]
  pathPrefix: string
  excludePrefixes: readonly string[]
}

export const SITES: readonly Site[] = [
  {
    id: 'naijei',
    label: 'naijei.com',
    short: 'naijei.com',
    color: '#4285F4',
    hosts: ['naijei.com', 'www.naijei.com'],
    pathPrefix: '/',
    excludePrefixes: ['/gnarly'],
  },
  {
    id: 'gnarly',
    label: 'gnarlynav.com',
    short: 'Gnarly',
    color: '#EA4335',
    hosts: ['gnarlynav.com', 'www.gnarlynav.com'],
    pathPrefix: '/',
    excludePrefixes: [],
  },
  {
    id: 'flashcards',
    label: 'flashcards.naijei.com',
    short: 'Flashcards',
    color: '#FBBC04',
    hosts: ['flashcards.naijei.com'],
    pathPrefix: '/',
    excludePrefixes: [],
  },
  {
    id: 'sql',
    label: 'sql.naijei.com',
    short: 'SQL',
    color: '#34A853',
    hosts: ['sql.naijei.com'],
    pathPrefix: '/',
    excludePrefixes: [],
  },
  {
    id: 'voter',
    label: 'voter.naijei.com',
    short: 'Voter',
    color: '#1A73E8',
    hosts: ['voter.naijei.com'],
    pathPrefix: '/',
    excludePrefixes: [],
  },
]

export function siteById(id: string): Site | undefined {
  return SITES.find((site) => site.id === id)
}

export function pathMatches(path: string, prefix: string): boolean {
  if (prefix === '/') return true
  return path === prefix || path.startsWith(`${prefix}/`)
}

/** Fail closed: zero or more than one match is not a site. */
export function resolveSite(host: string, path: string): Site | null {
  // Preserve attribution for legacy collector clients at the old redirect path.
  const legacyHosts = ['naijei.com', 'www.naijei.com']
  if (legacyHosts.includes(host) && pathMatches(path, '/gnarly')) {
    return { ...siteById('gnarly')!, hosts: legacyHosts, pathPrefix: '/gnarly' }
  }
  const matches = SITES.filter(
    (site) =>
      site.hosts.includes(host) &&
      pathMatches(path, site.pathPrefix) &&
      !site.excludePrefixes.some((prefix) => pathMatches(path, prefix)),
  )
  return matches.length === 1 ? matches[0] : null
}
