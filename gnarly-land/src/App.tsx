import { useEffect } from "react";
import { HeroStage } from "./HeroStage";
import { HowItWorks } from "./HowItWorks";
import { DemoRequest } from "./DemoRequest";
import { Nav } from "./Nav";
import { Footer, Proof, Tools } from "./Sections";
import { Arrow, Out, webMap } from "./ui";

/** Sections rise in once as they enter. Skipped entirely under reduced motion. */
function useReveal() {
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const root = document.documentElement;
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);
}

export default function App() {
  useReveal();
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Nav />
      <main id="content">
        <HeroStage>
          <div className="hero-copy">
            <h1 id="hero-title">
              <span className="line">
                <span>Walk a building.</span>
              </span>{" "}
              <span className="line">
                <span>Give visitors</span>
              </span>{" "}
              <span className="line">
                <span className="scan-word">directions.</span>
              </span>
            </h1>
            <p className="lede">
              Walk each floor once with a LiDAR iPhone. Gnarly turns the scan
              into a connected 3D map and guides visitors with a route drawn on
              the floor in AR.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#request-demo">
                Request a demo <Arrow />
              </a>
              <Out href={webMap} className="text-link">
                Explore the live map <Arrow kind="out" />
              </Out>
            </div>
          </div>
        </HeroStage>
        <Proof />
        <HowItWorks />
        <Tools />
        <DemoRequest />
      </main>
      <Footer />
    </>
  );
}
