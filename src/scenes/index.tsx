import type { ComponentType } from 'react'
import type { SceneId } from '../data/content'
import BioprintScene from './BioprintScene'
import ClusterScene from './ClusterScene'
import DownloaderScene from './DownloaderScene'
import GnarlyScene from './GnarlyScene'
import GroovyScene from './GroovyScene'
import SeeroundScene from './SeeroundScene'

const scenes: Record<SceneId, ComponentType<{ active: boolean }>> = {
  groovy: GroovyScene,
  downloader: DownloaderScene,
  gnarly: GnarlyScene,
  cluster: ClusterScene,
  seeround: SeeroundScene,
  bioprint: BioprintScene,
}

export default function Scene({ id, active }: { id: SceneId; active: boolean }) {
  const Component = scenes[id]
  return <Component active={active} />
}
