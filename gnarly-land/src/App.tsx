import { type ReactNode } from "react";
import { HeroStage } from "./HeroStage";
import { DemoRequest } from "./DemoRequest";

const film = "https://youtu.be/XkmW11bmEXg";
const filmAt = (seconds: number) => `${film}?t=${seconds}`;
const timecode = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const webMap = "https://gnarlynav.com";
const code = "https://github.com/gnarly-nav/gnarly";
const asset = (name: string) => `${import.meta.env.BASE_URL}evidence/${name}`;

function Out({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
function Arrow({ play = false }: { play?: boolean }) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {play ? <path d="m9 5 10 7-10 7Z" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
    </svg>
  );
}
function Brand() {
  return (
    <>
      <svg
        className="brand-mark"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 25V7h13v8h9v10H14V15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="5" cy="25" r="3" fill="currentColor" />
        <path
          d="m22 21 5 4-5 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>gnarly</span>
    </>
  );
}

/** One route, three views. Every frame is from the recorded walkthrough. */
const views = [
  {
    src: "plan.webp",
    width: 412,
    height: 898,
    kind: "phone",
    title: "The map Gnarly built",
    body: "The route planner on the phone: 78 m, about 2 minutes and 4 zone changes from the entrance.",
    alt: "Gnarly route planner on an iPhone showing a 3D model of the building's corridors with a blue route, and the summary 78 m, 2 min, 4 zone changes.",
    at: 74,
  },
  {
    src: "hallway.webp",
    width: 900,
    height: 920,
    kind: "camera",
    title: "The hallway",
    body: "Filmed from behind at the same moment as the AR view, as the route is followed.",
    alt: "Two people walk down a building corridor toward double doors, one holding up an iPhone running Gnarly.",
    at: 87,
  },
  {
    src: "ar.webp",
    width: 412,
    height: 898,
    kind: "phone",
    title: "The AR view",
    body: "A route drawn on the floor turns left at the end of the hall: 17.5 m to the next zone.",
    alt: "iPhone camera view of the corridor with a bright cyan route on the floor turning left near the doors, and the instruction Follow the path, 17.5 m to go.",
    at: 87,
  },
];
function Proof() {
  return (
    <section className="proof" id="product" aria-labelledby="proof-title">
      <div className="proof-inner">
        <div className="proof-heading">
          <h2 id="proof-title">Recorded in a real building.</h2>
          <p>
            One route through the Baker building, from the ground-floor entrance
            to the auditorium on the third floor. Phone screen recordings and
            camera footage from the team’s walkthrough, not renders.
          </p>
        </div>
        <div className="proof-views">
          {views.map((view) => (
            <figure className={`proof-view is-${view.kind}`} key={view.src}>
              <img
                src={asset(view.src)}
                width={view.width}
                height={view.height}
                alt={view.alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <strong>{view.title}</strong>
                {view.body}
                <Out href={filmAt(view.at)} className="timecode">
                  {timecode(view.at)} in the walkthrough
                </Out>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="proof-foot">
          <p>
            Also in the walkthrough: relocalizing in each new zone, an elevator
            handoff to floor 3, and arrival at the auditorium.
          </p>
          <div className="proof-links">
            <Out href={film} className="text-link">
              <Arrow play />
              Watch the walkthrough (2:44)
            </Out>
            <Out href={webMap} className="text-link">
              Explore the live map <Arrow />
            </Out>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    id: "capture",
    title: "Capture",
    body: "Walk each floor with the Gnarly mapper on a LiDAR iPhone. RoomPlan records walls and doorways while you drop named points for the places visitors ask for.",
    src: "capture.webp",
    width: 900,
    height: 674,
    alt: "A person walks a corridor holding an iPhone up to scan the hallway.",
    at: 14,
  },
  {
    id: "connect",
    title: "Connect",
    body: "Publish scans to the web editor, join zones on the same floor and link floors with elevators. Visitors download the building, with no app rebuild for each new map.",
    src: "connect.webp",
    width: 1360,
    height: 784,
    alt: "Gnarly web explorer showing a 3D scan of connected corridors with waypoints and a Where to? route form.",
    at: 29,
  },
  {
    id: "navigate",
    title: "Navigate",
    body: "Visitors pick a destination and follow the route on the floor. Gnarly relocalizes in each zone and after elevator rides. LiDAR watches for obstacles and haptics confirm the heading.",
    src: "elevator.webp",
    width: 412,
    height: 898,
    alt: "Gnarly on an iPhone inside an elevator, asking the visitor to ride up to floor 3 and confirm on arrival.",
    at: 113,
  },
];
function HowItWorks() {
  return (
    <section className="how section" id="how-it-works" aria-labelledby="how-title">
      <div className="how-heading">
        <h2 id="how-title">
          GPS stops at the front door.
          <br />
          <span>Gnarly takes it from there.</span>
        </h2>
        <p>
          Inside a hospital, campus or terminal, a first-time visitor has signs,
          a front desk and no blue dot. Gnarly gives the building one, mapped
          with an iPhone instead of beacons or wiring.
        </p>
      </div>
      <ol className="steps">
        {steps.map((step) => (
          <li className={`step is-${step.id}`} key={step.id}>
            <div className="step-copy">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            <figure className="step-visual">
              <img
                src={asset(step.src)}
                width={step.width}
                height={step.height}
                alt={step.alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <Out href={filmAt(step.at)} className="timecode">
                  {timecode(step.at)} in the walkthrough
                </Out>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}

const pageLinks = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
];
export default function App() {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="bar">
        <div className="bar-inner">
          <a className="wordmark" href="#content" aria-label="Gnarly home">
            <Brand />
          </a>
          <nav className="desk" aria-label="Primary">
            {pageLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="btn btn-small btn-primary" href="#request-demo">
            Request a demo
          </a>
        </div>
      </header>
      <main id="content">
        <HeroStage>
          <div className="hero-copy">
            <h1 id="hero-title">
              Walk a building.
              <br />
              <span>Give visitors directions.</span>
            </h1>
            <p className="lede">
              Walk through once with a LiDAR iPhone. Gnarly turns the scan into
              a connected map and guides visitors to the room they need with a
              route drawn on the floor in AR.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#request-demo">
                Request a demo <Arrow />
              </a>
              <a className="btn btn-line" href="#product">
                See a mapped route
              </a>
            </div>
          </div>
        </HeroStage>
        <Proof />
        <HowItWorks />
        <DemoRequest />
      </main>
      <footer className="foot">
        <a className="wordmark" href="#content" aria-label="Gnarly home">
          <Brand />
        </a>
        <p>Indoor directions from a single iPhone scan.</p>
        <nav aria-label="Footer">
          <a href="#how-it-works">How it works</a>
          <a href="#request-demo">Request a demo</a>
          <Out href={webMap}>Live map</Out>
          <Out href={film}>Walkthrough</Out>
          <Out href={code}>GitHub</Out>
        </nav>
        <span className="copyright">© {new Date().getFullYear()} Gnarly</span>
      </footer>
    </>
  );
}
