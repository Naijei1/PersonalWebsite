import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { loadConfig, productionBlockers } from './config.js'

const config = loadConfig(process.env)
const blockers = productionBlockers(config)
if (blockers.length > 0) {
  console.error(`Refusing to start. Missing or unusable settings: ${blockers.join(', ')}`)
  process.exit(1)
}

const dataFile = config.dataFile || fileURLToPath(new URL('../../data/events.ndjson', import.meta.url))
const host = process.env.HOST || '127.0.0.1'
const app = createApp({ config, dataFile })

app.listen(config.port, host, () => {
  console.log(
    `naijei admin on http://${host}:${config.port} (sign-in ${config.authReady ? 'configured' : 'not configured'}, preview ${config.demo})`,
  )
})
