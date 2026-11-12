import type { ReactNode } from "react";

export const film = "https://youtu.be/XkmW11bmEXg";
export const filmAt = (seconds: number) => `${film}?t=${seconds}`;
export const timecode = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
export const webMap = "https://gnarlynav.com";
export const code = "https://github.com/gnarly-nav/gnarly";
export const asset = (name: string) =>
  `${import.meta.env.BASE_URL}evidence/${name}`;

/** External link: new tab, announced to screen readers. */
export function Out({
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

export function Arrow({ kind = "right" }: { kind?: "right" | "out" | "play" }) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "play" ? (
        <path d="m9 6 9 6-9 6Z" />
      ) : kind === "out" ? (
        <path d="M8 16 16 8m-7 0h7v7" />
      ) : (
        <path d="M5 12h14m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

export function Brand() {
  return (
    <>
      <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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

/** Mono label with the scan glyph: a small square inside a ring. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-glyph" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Timestamp into the recorded walkthrough, styled as a mono chip. */
export function Timecode({ at }: { at: number }) {
  return (
    <Out href={filmAt(at)} className="timecode">
      <Arrow kind="play" />
      {timecode(at)} in the walkthrough
    </Out>
  );
}
