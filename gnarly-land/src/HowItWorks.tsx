import { useEffect, useRef, useState } from "react";
import { asset, Eyebrow, Timecode } from "./ui";

/** Every stage frame is from the recorded walkthrough. */
const steps = [
  {
    id: "scan",
    title: "Scan",
    body: "Walk each floor with the Gnarly mapper on a LiDAR iPhone. RoomPlan records walls and doorways while you drop named points for the places visitors ask for.",
    src: "capture.webp",
    width: 900,
    height: 674,
    kind: "camera",
    chip: "LiDAR iPhone · RoomPlan",
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
    kind: "browser",
    chip: "Zones joined · Elevators linked",
    alt: "Gnarly web explorer showing a 3D scan of connected corridors with waypoints and a Where to? route form.",
    at: 29,
  },
  {
    id: "follow",
    title: "Follow the floor",
    body: "Visitors pick a destination and follow a route drawn on the real floor. LiDAR watches for obstacles and haptics confirm the heading.",
    src: "ar.webp",
    width: 412,
    height: 898,
    kind: "phone",
    chip: "Route drawn on the floor",
    alt: "iPhone camera view of a corridor with a bright cyan route on the floor turning left near the doors.",
    at: 87,
  },
  {
    id: "floors",
    title: "Change floors",
    body: "At an elevator, Gnarly says which floor to ride to, then relocalizes when the visitor steps out and carries on in the next zone.",
    src: "elevator.webp",
    width: 412,
    height: 898,
    kind: "phone",
    chip: "Elevator to the next floor",
    alt: "Gnarly on an iPhone inside an elevator, asking the visitor to ride up to floor 3 and confirm on arrival.",
    at: 113,
  },
];
const pinQuery =
  "(min-width: 64rem) and (min-height: 40rem) and (prefers-reduced-motion: no-preference)";
const motionQuery = "(prefers-reduced-motion: no-preference)";
type Mode = "pinned" | "autoplay" | "manual";
const getMode = (): Mode =>
  matchMedia(pinQuery).matches
    ? "pinned"
    : matchMedia(motionQuery).matches
      ? "autoplay"
      : "manual";

/**
 * Wide screens pin the section and step through with scroll. Smaller screens
 * autoplay, six seconds a step, timed by the hairline above the open row.
 * Reduced motion opens one step at a time on request.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0),
    [mode, setMode] = useState<Mode>("manual"),
    [hold, setHold] = useState(false),
    [onScreen, setOnScreen] = useState(false);
  const section = useRef<HTMLElement>(null),
    panels = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const queries = [matchMedia(pinQuery), matchMedia(motionQuery)];
    const update = () => setMode(getMode());
    update();
    queries.forEach((q) => q.addEventListener("change", update));
    const io = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    if (section.current) io.observe(section.current);
    return () => {
      queries.forEach((q) => q.removeEventListener("change", update));
      io.disconnect();
    };
  }, []);
  // Pinned: the scroll position through the section picks the step.
  useEffect(() => {
    if (mode !== "pinned") return;
    let pending = 0;
    const read = () => {
      pending = 0;
      const box = section.current?.getBoundingClientRect();
      if (!box) return;
      const span = box.height - innerHeight,
        p = span > 0 ? Math.min(1, Math.max(0, -box.top / span)) : 0;
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    const scroll = () => {
      if (!pending) pending = requestAnimationFrame(read);
    };
    read();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(pending);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
    };
  }, [mode]);
  // Hidden panels leave the tab order (their timestamp links included).
  useEffect(() => {
    panels.current.forEach((panel, i) =>
      panel?.toggleAttribute("inert", i !== active),
    );
  }, [active]);
  const open = (index: number) => {
    if (mode !== "pinned") return setActive(index);
    // Scroll to the middle of that step's stretch of the pin.
    const box = section.current!.getBoundingClientRect(),
      span = box.height - innerHeight;
    scrollTo({
      top: scrollY + box.top + ((index + 0.5) / steps.length) * span,
      behavior: "smooth",
    });
  };
  const running = mode === "autoplay" && onScreen && !hold;
  return (
    <section
      ref={section}
      className="how"
      id="how-it-works"
      aria-labelledby="how-title"
      data-mode={mode}
      style={{ ["--steps" as string]: steps.length }}
    >
      <div className="how-pin">
        <div className="how-inner">
          <div
            className="how-copy"
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
          >
            <Eyebrow>
              How it works
              {mode === "pinned" && (
                <span className="eyebrow-hint"> · Scroll to step through</span>
              )}
            </Eyebrow>
            <h2 id="how-title">From one walk-through to turn-by-turn.</h2>
            <ol className="step-list">
              {steps.map((step, i) => (
                <li
                  key={step.id}
                  className="step"
                  data-open={i === active}
                >
                  {mode === "autoplay" && i === active && (
                    <span
                      key={`${active}`}
                      className="step-timer"
                      data-running={running}
                      onAnimationEnd={() =>
                        setActive((active + 1) % steps.length)
                      }
                      aria-hidden="true"
                    />
                  )}
                  <h3>
                    <button
                      type="button"
                      id={`step-${step.id}`}
                      aria-expanded={i === active}
                      aria-controls={`step-${step.id}-body`}
                      onClick={() => open(i)}
                    >
                      <span className="step-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="step-title">{step.title}</span>
                      <span className="step-toggle" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="step-body"
                    id={`step-${step.id}-body`}
                    role="region"
                    aria-labelledby={`step-${step.id}`}
                  >
                    <div>
                      <p>{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="how-stage">
            <div className="stage-field" aria-hidden="true" />
            {steps.map((step, i) => (
              <figure
                key={step.id}
                ref={(el) => (panels.current[i] = el)}
                className={`stage-panel is-${step.kind}`}
                data-active={i === active}
                aria-hidden={i !== active}
              >
                <div className={`device device-${step.kind}`}>
                  {step.kind === "browser" && (
                    <span className="browser-bar" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <span>gnarlynav.com</span>
                    </span>
                  )}
                  <img
                    src={asset(step.src)}
                    width={step.width}
                    height={step.height}
                    alt={step.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="stat-chip">{step.chip}</span>
                <figcaption>
                  <Timecode at={step.at} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
