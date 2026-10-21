import type { ComponentType } from 'react'
import type { SceneId } from '../data/content'

/** Each loader is dynamic so Three.js stays out of the initial bundle until a card is on screen. */
export const sceneLoaders: Record<SceneId, () => Promise<{ default: ComponentType<{ active: boolean }> }>> = {
  groovy: () => import('./GroovyScene'),
  downloader: () => import('./DownloaderScene'),
  gnarly: () => import('./GnarlyScene'),
  cluster: () => import('./ClusterScene'),
  seeround: () => import('./SeeroundScene'),
  bioprint: () => import('./BioprintScene'),
  snake: () => import('./SnakeScene'),
}
