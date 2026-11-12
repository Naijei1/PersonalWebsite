import { Arrow, asset, Brand, code, Eyebrow, film, Out, Timecode, webMap } from "./ui";

/* ───────────── Proof ───────────── */
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
export function Proof() {
  return (
    <section className="proof section" id="field-test" aria-labelledby="proof-title">
      <div className="section-head split" data-reveal>
        <div>
          <Eyebrow>Field test · 2:44 walkthrough</Eyebrow>
          <h2 id="proof-title">Recorded in a real building.</h2>
        </div>
        <p className="lede">
          One route through a two-floor campus building, from the entrance to
          a destination on the upper floor. Phone screen recordings and camera
          footage from our walkthrough, not renders.
        </p>
      </div>
      <div className="proof-stage" data-reveal>
        {views.map((view) => (
          <figure className={`proof-view is-${view.kind}`} key={view.src}>
            <div className={`device device-${view.kind}`}>
              <img
                src={asset(view.src)}
                width={view.width}
                height={view.height}
                alt={view.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>
              <strong>{view.title}</strong>
              <span>{view.body}</span>
              <Timecode at={view.at} />
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="proof-foot">
        <p>
          Also in the walkthrough: relocalizing in each new zone, the elevator
          handoff between floors, and arrival at the destination.
        </p>
        <div className="link-row">
          <Out href={film} className="text-link">
            <Arrow kind="play" />
            Watch the walkthrough (2:44)
          </Out>
          <Out href={webMap} className="text-link">
            Explore the live map <Arrow kind="out" />
          </Out>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Tools (light) ───────────── */
export function Tools() {
  return (
    <section className="tools light" id="product" aria-labelledby="tools-title">
      <div className="section">
        <div className="section-head split" data-reveal>
          <div>
            <Eyebrow>The product</Eyebrow>
            <h2 id="tools-title">One scan. Three tools.</h2>
          </div>
          <p className="lede">
            A mapper to capture the building, a web editor to connect it and a
            navigator that walks visitors through it. Built first for campus
            buildings.
          </p>
        </div>
        <div className="bento" data-reveal>
          <article className="tile tone-a">
            <div className="tile-art">
              <span className="glass-tag">Mapper</span>
              <svg className="tile-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <rect x="20" y="8" width="24" height="48" rx="5" />
                <path d="M28 12h8" />
                <path d="M8 22h48M8 30h48M8 38h48" strokeDasharray="0 4" strokeWidth="2" />
              </svg>
            </div>
            <h3>Capture walls, doors and the places people ask for.</h3>
            <p>
              The mapper runs on a LiDAR iPhone. RoomPlan records each zone as
              you walk it, and you drop named points as you go. The phone is
              the only hardware: no beacons, nothing mounted in the building.
            </p>
          </article>
          <article className="tile tone-b span-2">
            <div className="tile-art">
              <span className="glass-tag">Web editor</span>
              <div className="peek device device-browser">
                <span className="browser-bar" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>gnarlynav.com</span>
                </span>
                <img
                  src={asset("connect.webp")}
                  width={1360}
                  height={784}
                  alt="The Gnarly web explorer with scanned corridors, waypoints and a route form."
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <h3>Arrange zones and floors, then publish.</h3>
            <p>
              Join zones on a floor, link floors with elevators and preview
              routes. Visitors download the updated building, with no app
              rebuild.
            </p>
          </article>
          <article className="tile tone-c span-2">
            <div className="tile-art">
              <span className="glass-tag">Navigator</span>
              <div className="peek device device-phone">
                <img
                  src={asset("plan.webp")}
                  width={412}
                  height={898}
                  alt="The Gnarly route planner on an iPhone, showing a route's distance, time and zone changes."
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <h3>Turn-by-turn on the real floor.</h3>
            <p>
              Visitors choose a room, see the distance and time, then follow
              the route in AR with obstacle and haptic cues.
            </p>
          </article>
          <article className="tile tone-d">
            <div className="tile-art">
              <span className="glass-tag">Open</span>
              <svg className="tile-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 20-12 12 12 12M42 20l12 12-12 12M36 14l-8 36" />
              </svg>
            </div>
            <h3>Built in the open.</h3>
            <p>
              The Gnarly code is on GitHub.{" "}
              <Out href={code} className="inline-link">
                Read the source
              </Out>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Footer ───────────── */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <p className="foot-tagline">Indoor directions from a single walk-through.</p>
        <a className="btn btn-primary" href="#request-demo">
          Request a demo <Arrow />
        </a>
      </div>
      <div className="foot-bottom">
        <a className="wordmark" href="#content" aria-label="Gnarly home">
          <Brand />
        </a>
        <span className="copyright">© {new Date().getFullYear()} Gnarly</span>
        <nav aria-label="Footer">
          <a href="#field-test">Field test</a>
          <a href="#how-it-works">How it works</a>
          <a href="#product">Product</a>
          <a href="#request-demo">Request a demo</a>
          <Out href={webMap}>Live map</Out>
          <Out href={film}>Walkthrough</Out>
          <Out href={code}>GitHub</Out>
        </nav>
      </div>
    </footer>
  );
}
