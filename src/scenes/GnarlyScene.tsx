import ConceptA from './gnarly/ConceptA'
import ConceptB from './gnarly/ConceptB'
import ConceptC from './gnarly/ConceptC'

/** Preview switch. `?gnarly=b` or `?gnarly=c`; anything else, including no param, is A. */
export function gnarlyVariant(): 'a' | 'b' | 'c' {
  const value = new URLSearchParams(window.location.search).get('gnarly')?.toLowerCase()
  return value === 'b' || value === 'c' ? value : 'a'
}

export default function GnarlyScene({ active }: { active: boolean }) {
  const variant = gnarlyVariant()
  if (variant === 'b') return <ConceptB active={active} />
  if (variant === 'c') return <ConceptC active={active} />
  return <ConceptA active={active} />
}
