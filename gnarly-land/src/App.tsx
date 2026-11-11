import type { ReactNode } from 'react'
import { NavigateDiagram, PublishDiagram, ScanDiagram } from './diagrams'

const liveMap = 'https://naijei.com/gnarly/'
const film = 'https://youtu.be/XkmW11bmEXg'
const code = 'https://github.com/gnarly-nav/gnarly'
const home = 'https://naijei.com/'
const frame = `${import.meta.env.BASE_URL}film-frame.jpg`

function Out({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

function Tape() {
  return <div className="tape" aria-hidden="true" />
}

const pageLinks = [
  { href: film, label: 'Watch the demo', external: true },
  { href: code, label: 'View the code', external: true },
  { href: home, label: 'naijei.com', external: false },
]

export default function App() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="bar">
        <a className="wordmark" href="#content">
          Gnarly
        </a>
        <p className="lockup">A Cornell project</p>
        <div className="bar-spacer" />
        <nav className="desk" aria-label="Primary">
          {pageLinks.map((link) =>
            link.external ? (
              <Out key={link.label} href={link.href}>
                {link.label}
              </Out>
            ) : (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>
        <details className="menu">
          <summary>Menu</summary>
          <nav aria-label="Primary">
            {pageLinks.map((link) =>
              link.external ? (
                <Out key={link.label} href={link.href}>
                  {link.label}
                </Out>
              ) : (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </details>
        <a className="btn btn-primary" href={liveMap} aria-label="Open the live map">
          <span className="bar-long">Open the live map</span>
          <span className="bar-short">Live map</span>
        </a>
      </header>
      <div className="sweep" aria-hidden="true" />
      <main id="content">
        <section className="hero" aria-labelledby="hero-title">
          <Tape />
          <div className="hero-grid">
            <div>
              <h1 id="hero-title" className="sign-title">
                Scan a building. Walk it in AR.
              </h1>
              <p className="lede">
                Gnarly turns a LiDAR iPhone scan into turn-by-turn indoor navigation — on the phone, in the
                space itself.
              </p>
              <div className="actions">
                <a className="btn btn-primary" href={liveMap}>
                  Open the live map
                </a>
                <Out className="btn btn-line" href={film}>
                  Watch the demo
                </Out>
                <Out className="text-link" href={code}>
                  View the code
                </Out>
              </div>
            </div>
            <figure>
              <Out className="film" href={film}>
                <img
                  src={frame}
                  width={1180}
                  height={560}
                  alt=""
                  fetchPriority="high"
                />
                <span className="sr-only">
                  Frame from the demo film: a phone route planner beside two people in a hallway.
                </span>
                <span className="film-label" aria-hidden="true">
                  Watch the demo
                </span>
              </Out>
              <figcaption className="caption">
                Frame from the demo film. This still is not the North Hall sample.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="band" id="problem" aria-labelledby="problem-title">
          <Tape />
          <h2 id="problem-title">GPS stops at the door.</h2>
          <p className="lede">
            Inside a building, maps go stale and signs run out. Gnarly maps the rooms as they are, from the phone
            in your hand.
          </p>
          <ul className="proofs">
            <li>Scanned from the device</li>
            <li>No beacons to install</li>
            <li>The route draws in AR</li>
          </ul>
        </section>

        <section className="band" id="scan" aria-labelledby="scan-title">
          <Tape />
          <div className="split">
            <div>
              <h2 id="scan-title">Walk the space. The phone keeps the map.</h2>
              <p className="lede">
                The mapper uses iPhone LiDAR and RoomPlan to capture rooms, doorways, and a path you can walk again.
              </p>
            </div>
            <figure className="phone">
            <div className="stage">
              <ScanDiagram />
              <p className="plate-label">Capture pending</p>
            </div>
            <figcaption className="caption">
              Diagram of a LiDAR sweep and a walked path. This is not a recorded scan.
            </figcaption>
          </figure>
          </div>
        </section>

        <section className="band" id="publish" aria-labelledby="publish-title">
          <Tape />
          <h2 id="publish-title">Join the rooms, then share the building.</h2>
          <p className="lede">
            The web editor places zones on each floor, links elevators, and publishes the map to the cloud library.
          </p>
          <figure>
            <div className="stage">
              <PublishDiagram />
              <p className="plate-label">Capture pending</p>
            </div>
            <figcaption className="caption">
              Diagram of two zones joined through an elevator. Not a capture of North Hall. North Hall is the
              labeled sample in the live map, and some other buildings in that list are still incomplete.
            </figcaption>
          </figure>
        </section>

        <section className="navigate" id="navigate" aria-labelledby="navigate-title">
          <Tape />
          <figure className="corridor">
            <NavigateDiagram />
            <p className="plate-label">Capture pending</p>
          </figure>
          <div className="sign">
            <h2 id="navigate-title">Follow the path in the room itself.</h2>
            <p className="lede">
              The navigator relocalizes, draws a floor-aligned AR route, and uses LiDAR and haptics when something
              stands in the way.
            </p>
            <p className="caption">
              Diagram of a floor-aligned route. An AR recording of a real corridor has not been captured for this
              page.
            </p>
          </div>
        </section>

        <section className="band" id="demo" aria-labelledby="demo-title">
          <Tape />
          <h2 id="demo-title">Try a building in the browser.</h2>
          <p className="lede">
            Pick a map, inspect the scan, and preview a route in the live companion. North Hall is a labeled
            sample. Some other buildings in that list are still incomplete.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href={liveMap}>
              Open the live map
            </a>
          </div>
        </section>

        <section className="band" id="tech" aria-labelledby="tech-title">
          <Tape />
          <h2 id="tech-title">On the phone, in the cloud, in the browser.</h2>
          <p className="lede">
            Scanning and AR run on a LiDAR iPhone. Maps live on AWS. The companion is a React app you can open
            now. Local capture and relocalization also work without the cloud.
          </p>
          <dl className="stack">
            <div>
              <dt>Mapper</dt>
              <dd>Swift, ARKit, RoomPlan</dd>
            </div>
            <div>
              <dt>Navigator</dt>
              <dd>Unity</dd>
            </div>
            <div>
              <dt>Web companion</dt>
              <dd>React, Vite</dd>
            </div>
            <div>
              <dt>Cloud library</dt>
              <dd>Cognito, Lambda, DynamoDB, S3</dd>
            </div>
          </dl>
          <p className="note">
            Gaussian splats exist in the repository as an experimental layer. They are not what navigation uses
            today.
          </p>
        </section>

        <section className="band day" id="team" aria-labelledby="team-title">
          <Tape />
          <h2 id="team-title">Built at Cornell.</h2>
          <p className="lede">
            A student team started Gnarly at BigRed//Hacks 2026 and has kept building the mapper, the navigator,
            and the web map.
          </p>
          <p className="note">
            Names, order, and photos are not shown until the team confirms them.
          </p>
        </section>

        <section className="band" id="close" aria-labelledby="close-title">
          <Tape />
          <h2 id="close-title">See it, or read the code.</h2>
          <p className="lede">Open the live map, watch the walkthrough, or go to the repository.</p>
          <div className="actions">
            <a className="btn btn-primary" href={liveMap}>
              Open the live map
            </a>
            <Out className="btn btn-line" href={film}>
              Watch the demo
            </Out>
            <Out className="text-link" href={code}>
              View the code
            </Out>
          </div>
        </section>
      </main>
      <footer className="foot">
        <Tape />
        <p>A Cornell project, not a commercial product.</p>
        <a href={home}>naijei.com</a>
        <a href={liveMap}>Live map</a>
        <Out href={code}>Code</Out>
      </footer>
    </>
  )
}
