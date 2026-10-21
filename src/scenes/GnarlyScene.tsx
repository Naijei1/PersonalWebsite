import ConceptD from './gnarly/ConceptD'
import ConceptE from './gnarly/ConceptE'
import ConceptF from './gnarly/ConceptF'
import Original from './gnarly/Original'

/** Preview switch. `?gnarly=d|e|f`; anything else, including no param, is the scene from main. */
export function gnarlyVariant(): 'original' | 'd' | 'e' | 'f' {
  const value = new URLSearchParams(window.location.search).get('gnarly')?.toLowerCase()
  if (value === 'd' || value === 'e' || value === 'f') return value
  return 'original'
}

export default function GnarlyScene({ active }: { active: boolean }) {
  const variant = gnarlyVariant()
  if (variant === 'd') return <ConceptD active={active} />
  if (variant === 'e') return <ConceptE active={active} />
  if (variant === 'f') return <ConceptF active={active} />
  return <Original active={active} />
}
