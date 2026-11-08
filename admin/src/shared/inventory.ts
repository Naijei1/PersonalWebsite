export type Site = {
  id: string
  label: string
  short: string
  color: string
  hosts: readonly string[]
  pathPrefix: string
  excludePrefixes: readonly string[]
}

/**
 * naijei.com/gnarly is its own site. The main site excludes that prefix
 * so one event cannot land in both.
 */
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
    label: 'naijei.com/gnarly',
    short: '/gnarly',
    color: '#EA4335',
    hosts: ['naijei.com', 'www.naijei.com'],
    pathPrefix: '/gnarly',
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
  const matches = SITES.filter(
    (site) =>
      site.hosts.includes(host) &&
      pathMatches(path, site.pathPrefix) &&
      !site.excludePrefixes.some((prefix) => pathMatches(path, prefix)),
  )
  return matches.length === 1 ? matches[0] : null
}
