import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneController, ScenePhase } from "./cinematic-scene";
const destinations = ["Lecture hall", "Room 104", "Front desk"];
const descriptions = [
  "Follow the corridor to the end. The lecture hall is on your left.",
  "Continue down the corridor. Room 104 is the second door on your right.",
  "Walk in, then take the first door on your left.",
];
const paths = [
  "M440 520V130H245",
  "M440 520V290H625",
  "M440 520V450H245",
];
// Plan coordinates after the fallback's skew, for upright labels.
const fallbackLabels = [
  { x: 336, y: 122 },
  { x: 570, y: 300 },
  { x: 160, y: 300 },
];
const captions: Record<ScenePhase, string> = {
  scanning: "Scanning with a LiDAR iPhone",
  mapping: "Rooms, doorways and floors connected",
  navigating: "Drawing the route",
  ready: "Finally connected.",
};
/** Wide screens scrub the route with scroll; phones play the short version. */
const scrubQuery = "(min-width: 900px) and (min-height: 620px)";
function SpatialFallback({ destination }: { destination: number }) {
  return (
    <svg
      className="spatial-fallback"
      viewBox="0 0 900 650"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="room-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path d="M32 0H0V32" stroke="#6c8cb6" strokeOpacity=".13" />
        </pattern>
      </defs>
      <g transform="translate(230 10) matrix(.8 .24 -.55 .55 0 0)">
        <path d="M100 40H760V560H100Z" fill="#17253a" stroke="#8ca6cd" />
        <path d="M100 40H760V560H100Z" fill="url(#room-grid)" />
        {[70, 230, 390].map((y) => (
          <g key={y}>
            <path
              d={`M130 ${y}h230v120H130Z M520 ${y}h210v120H520Z`}
              fill="#243850"
              stroke="#6b87ac"
            />
            <path
              d={`M360 ${y}v40 M360 ${y + 80}v40 M520 ${y}v40 M520 ${y + 80}v40`}
              stroke="#94afd3"
              strokeWidth="3"
            />
          </g>
        ))}
        <path
          d={paths[destination]}
          stroke="#4d7bff"
          strokeOpacity=".35"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="scan-route"
          key={destination}
          d={paths[destination]}
          pathLength="1"
          stroke="#d6e6ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="scan-point"
          cx="440"
          cy="520"
          r="11"
          fill="#ffffff"
        />
      </g>
      <text x="306" y="436" className="fallback-label">
        Main entrance
      </text>
      <text
        x={fallbackLabels[destination].x}
        y={fallbackLabels[destination].y}
        className="fallback-label"
      >
        {destinations[destination]}
      </text>
    </svg>
  );
}
export function HeroStage({ children }: { children: ReactNode }) {
  const destinationRef = useRef(0),
    selectionMade = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    track = useRef<HTMLDivElement>(null),
    startLabel = useRef<HTMLSpanElement>(null),
    endLabel = useRef<HTMLSpanElement>(null),
    panel = useRef<HTMLDivElement>(null),
    controller = useRef<SceneController | null>(null);
  const [ready, setReady] = useState(false),
    [reduced, setReduced] = useState(false),
    [scrubbed, setScrubbed] = useState(false),
    [phase, setPhase] = useState<ScenePhase>("scanning"),
    [autoplaying, setAutoplaying] = useState(true),
    [paused, setPaused] = useState(false),
    [destination, setDestination] = useState(0);
  const progress = () => {
    const element = track.current;
    if (!element) return 0;
    const box = element.getBoundingClientRect(),
      stage = element.firstElementChild?.getBoundingClientRect(),
      span = box.height - (stage?.height || 0);
    return span > 1 ? (stage!.top - box.top) / span : 0;
  };
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)"),
      wide = matchMedia(scrubQuery);
    let cancelled = false,
      instance: SceneController | null = null,
      pending = 0;
    const setup = async () => {
      setReduced(preference.matches);
      if (preference.matches) {
        instance?.dispose();
        instance = null;
        controller.current = null;
        setReady(false);
        setPhase("ready");
        return;
      }
      try {
        const { mountCinematic } = await import("./cinematic-scene");
        if (cancelled || !canvas.current || preference.matches) return;
        setPhase("scanning");
        setAutoplaying(true);
        setPaused(false);
        instance = mountCinematic(canvas.current, {
          onPhase: setPhase,
          onReady: () => setReady(true),
          onAutoplayEnd: () => setAutoplaying(false),
          labels: { start: startLabel.current, end: endLabel.current },
        });
        controller.current = instance;
        instance.setScrubbed(wide.matches);
        setScrubbed(wide.matches);
        instance.setProgress(progress());
        if (selectionMade.current) instance.destination(destinationRef.current);
      } catch {
        setReady(false);
        setPhase("ready");
      }
    };
    void setup();
    const change = () => {
      instance?.dispose();
      instance = null;
      controller.current = null;
      setReady(false);
      void setup();
    };
    const resize = () => {
      instance?.setScrubbed(wide.matches);
      setScrubbed(wide.matches);
    };
    const scroll = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        instance?.setProgress(progress());
      });
    };
    preference.addEventListener("change", change);
    wide.addEventListener("change", resize);
    addEventListener("scroll", scroll, { passive: true });
    const lost = (event: Event) => {
      event.preventDefault();
      instance?.dispose();
      controller.current = null;
      setReady(false);
      setPhase("ready");
    };
    const element = canvas.current;
    element?.addEventListener("webglcontextlost", lost);
    return () => {
      cancelled = true;
      cancelAnimationFrame(pending);
      instance?.dispose();
      preference.removeEventListener("change", change);
      wide.removeEventListener("change", resize);
      removeEventListener("scroll", scroll);
      element?.removeEventListener("webglcontextlost", lost);
    };
  }, []);
  const selectDestination = (index: number) => {
    destinationRef.current = index;
    selectionMade.current = true;
    setDestination(index);
    controller.current?.destination(index);
  };
  const replay = () => {
    if (scrubbed) {
      // The hero opens the page; start at the top so scroll and scene agree.
      scrollTo({ top: 0 });
      controller.current?.setProgress(0);
    }
    controller.current?.replay();
    setAutoplaying(true);
    setPaused(false);
  };
  const live = ready && !reduced;
  // The route picker appears once there is a route to change.
  const revealed = !live || phase === "ready";
  const holding = live && scrubbed && !autoplaying && phase !== "ready";
  const focusPicker = useRef(false);
  const finish = () => {
    focusPicker.current = true;
    controller.current?.finish();
  };
  useEffect(() => {
    panel.current?.toggleAttribute("inert", !revealed);
    // Skipping ahead hands keyboard focus to the next useful control.
    if (revealed && focusPicker.current) {
      focusPicker.current = false;
      document.getElementById("destination")?.focus();
    }
  }, [revealed]);
  // One persistent button keeps focus as its job changes.
  const primary =
    phase === "ready"
      ? { label: "Replay the journey", run: replay }
      : holding
        ? { label: "Show the route", run: finish }
        : {
            label: paused ? "Play animation" : "Pause animation",
            run: () => {
              if (paused) controller.current?.play();
              else controller.current?.pause();
              setPaused(!paused);
            },
          };
  return (
    <div
      ref={track}
      className={`hero-track ${live ? "" : "is-static"}`}
    >
      <section
        className={`hero cinematic-hero ${ready ? "has-scene" : ""}`}
        aria-labelledby="hero-title"
        data-phase={phase}
      >
        {children}
        <div className="cinematic-scene">
          <SpatialFallback destination={destination} />
          <canvas
            ref={canvas}
            className="cinematic-canvas"
            aria-hidden="true"
          />
          <span className="scene-label" aria-hidden="true" ref={startLabel}>
            <span>Main entrance</span>
          </span>
          <span
            className="scene-label is-end"
            aria-hidden="true"
            ref={endLabel}
          >
            <span>{destinations[destination]}</span>
          </span>
          <div className="scene-shade" aria-hidden="true" />
          <p className="scene-caption">
            <span className="scene-dot" aria-hidden="true" />
            <span>{live ? captions[phase] : captions.ready}</span>
            <span className="scene-tag">Illustrative model</span>
          </p>
          {live && (
            <div className="cinematic-controls">
              {holding && (
                <span className="scroll-cue" aria-hidden="true">
                  Scroll to draw the route
                </span>
              )}
              <button type="button" onClick={primary.run}>
                {primary.label}
              </button>
              {!holding && phase !== "ready" && (
                <button type="button" onClick={finish}>
                  Skip intro
                </button>
              )}
            </div>
          )}
        </div>
        <div
          className="destination-panel"
          id="try-a-route"
          ref={panel}
          data-revealed={revealed}
        >
          <p className="destination-from">
            <span>From</span> Main entrance
          </p>
          <label htmlFor="destination">Choose a destination</label>
          <div className="destination-select">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M7 20V9h11m-5-5 5 5-5 5" />
            </svg>
            <select
              id="destination"
              value={destination}
              onChange={(event) =>
                selectDestination(Number(event.target.value))
              }
            >
              {destinations.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <p className="destination-steps" aria-live="polite">
            {descriptions[destination]}
          </p>
        </div>
      </section>
    </div>
  );
}
