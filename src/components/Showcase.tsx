import { Box, MousePointer2 } from 'lucide-react'
import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { asset, type Featured } from '../data/content'
import { useCan3D, useInView, useMediaQuery } from '../lib/hooks'
import { sceneLoaders } from '../scenes'
import SnakeNodes from './SnakeNodes'

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function Showcase({ project }: { project: Featured }) {
  const can3D = useCan3D()
  const phone = useMediaQuery('(max-width: 767px)')
  // Mount just before the card enters, and drop it (context included) as soon as it leaves.
  const [ref, near] = useInView<HTMLDivElement>(phone ? '160px 0px' : '280px 0px')
  const [posterOk, setPosterOk] = useState(true)
  const Scene = useMemo(() => lazy(sceneLoaders[project.id]), [project.id])
  const live = near && can3D

  const poster = posterOk ? (
    <img
      src={asset(`showcase/${project.id}.png`)}
      alt={`Illustration of ${project.name}: ${project.idea}`}
      loading="lazy"
      decoding="async"
      onError={() => setPosterOk(false)}
      className="h-full w-full object-contain"
    />
  ) : null

  const hint = project.id === 'groovy' ? 'Click a drum or press D F J K' : 'Move your cursor to tilt'

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem]"
      style={{
        background: `radial-gradient(120% 90% at 50% 15%, ${project.accent}22, ${project.accent}08 60%, transparent)`,
      }}
    >
      {project.id === 'snake' && live && <SnakeNodes />}

      {live ? (
        <SceneBoundary fallback={poster}>
          <Suspense fallback={poster}>
            <div className="absolute inset-0" role="img" aria-label={`Interactive 3D scene: ${project.idea}`}>
              <Scene active />
            </div>
          </Suspense>
        </SceneBoundary>
      ) : (
        poster
      )}

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-ink shadow-card backdrop-blur dark:bg-night-raised/85 dark:text-night-text">
          <Box className="h-3.5 w-3.5" style={{ color: project.accent }} />
          {live ? 'Live 3D' : '3D preview'}
        </span>
        {live && (
          <span className="hidden items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-ink-soft shadow-card backdrop-blur dark:bg-night-raised/85 dark:text-night-soft sm:inline-flex">
            <MousePointer2 className="h-3.5 w-3.5" /> {hint}
          </span>
        )}
      </div>
    </div>
  )
}
