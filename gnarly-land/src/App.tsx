import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavigateDiagram, PublishDiagram, ScanDiagram } from './diagrams'
import { HeroStage, PhoneMock } from './HeroStage'

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

const steps = [
  {
    id: 'scan',
    title: 'Walk the space. The phone keeps the map.',
    body: 'The mapper uses iPhone LiDAR and RoomPlan to capture rooms, doorways, and a path you can walk again.',
    note: 'Capture pending. Diagram of a LiDAR sweep, not a recorded scan.',
  },
  {
    id: 'publish',
    title: 'Join the rooms, then share the building.',
    body: 'The web editor places zones on each floor, links elevators, and publishes the map to the cloud library.',
    note: 'Capture pending. Diagram of two zones and an elevator, not a capture of North Hall.',
  },
  {
    id: 'navigate',
    title: 'Follow the path in the room itself.',
    body: 'The navigator relocalizes, draws a floor-aligned AR route, and uses LiDAR and haptics when something stands in the way.',
    note: 'Capture pending. Diagram of a floor-aligned route, not an AR recording.',
  },
] as const

function Story() {
  const ref = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 860px)').matches
    if (reduce || narrow) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const total = el.offsetHeight - window.innerHeight
        if (total <= 0) return
        const progress = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total))
        setStep(progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section className="story night" ref={ref} aria-labelledby="scan-title">
      <div className="story-sticky">
        <div className="story-copy">
          {steps.map((item, index) => (
            <article key={item.id} id={item.id} className={index === step ? 'step is-on' : 'step'}>
              <h2 id={index === 0 ? 'scan-title' : undefined}>{item.title}</h2>
              <p className="lede">{item.body}</p>
              <p className="caption">{item.note}</p>
            </article>
          ))}
        </div>
        <div className="story-visual" aria-hidden="true">
          <div className={step === 0 ? 'visual is-on' : 'visual'}>
            <ScanDiagram />
          </div>
          <div className={step === 1 ? 'visual is-on' : 'visual'}>
            <PublishDiagram />
          </div>
          <div className={step === 2 ? 'visual is-on' : 'visual'}>
            <NavigateDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}

const pageLinks = [
  { href: '#film', label: 'Watch the demo', external: false },
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
      <main id="content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="stage-frame">
            <HeroStage />
            <PhoneMock />
            <div className="hero-copy">
            <h1 id="hero-title" className="sign-title">
              Scan a building. Walk it in AR.
            </h1>
            <p className="lede">
              Gnarly turns a LiDAR iPhone scan into turn-by-turn indoor navigation — on the phone, in the space
              itself.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href={liveMap}>
                Open the live map
              </a>
              <a className="text-link" href="#film">
                Watch the demo
              </a>
              <Out className="text-link" href={code}>
                View the code
              </Out>
            </div>
            </div>
          </div>
          <p className="hero-note">The phone is a diagram of the navigator, not a recording.</p>
        </section>

        <section className="band band-tight" id="problem" aria-labelledby="problem-title">
          <Tape />
          <h2 id="problem-title">GPS stops at the door.</h2>
          <p className="lede">
            Inside a building, maps go stale and signs run out. Gnarly maps the rooms as they are, from the phone
            in your hand.
          </p>
          <p className="facts">
            <span>Scanned from the device</span>
            <span>No beacons to install</span>
            <span>The route draws in AR</span>
          </p>
        </section>

        <Story />

        <section className="band" id="film" aria-labelledby="film-title">
          <Tape />
          <h2 id="film-title">Watch the walkthrough.</h2>
          <p className="lede">
            The recording is the demo film. This frame is not the North Hall sample.
          </p>
          <figure className="film-figure">
            <Out className="film" href={film}>
              <img src={frame} width={1180} height={560} alt="" loading="lazy" />
              <span className="sr-only">
                Frame from the demo film: a phone route planner beside two people in a hallway.
              </span>
            </Out>
            <figcaption className="caption">
              <Out href={film}>Watch the demo</Out>
            </figcaption>
          </figure>
        </section>

        <section className="band night" id="demo" aria-labelledby="demo-title">
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

        <section className="band night" id="tech" aria-labelledby="tech-title">
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

        <section className="band night" id="close" aria-labelledby="close-title">
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
