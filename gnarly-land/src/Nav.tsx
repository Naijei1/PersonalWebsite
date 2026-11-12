import { useEffect, useRef, useState } from "react";
import { Arrow, Brand, Out, webMap } from "./ui";

const links = [
  { href: "#field-test", label: "Field test" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#product", label: "Product" },
];

/** Floating glass card. Below 48rem the links fold into a menu; the CTA stays. */
export function Nav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null),
    toggle = useRef<HTMLButtonElement>(null),
    menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Closed menus leave the tab order and the accessibility tree.
    menu.current?.toggleAttribute("inert", !open);
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const wide = matchMedia("(min-width: 48rem)");
    const close = () => wide.matches && setOpen(false);
    addEventListener("keydown", key);
    addEventListener("pointerdown", away);
    wide.addEventListener("change", close);
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("pointerdown", away);
      wide.removeEventListener("change", close);
    };
  }, [open]);
  return (
    <header className="nav" ref={root} data-open={open}>
      <div className="nav-card">
        <a className="wordmark" href="#content" aria-label="Gnarly home">
          <Brand />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Out href={webMap}>
            Live map <Arrow kind="out" />
          </Out>
        </nav>
        <a className="btn btn-ghost btn-small" href="#request-demo">
          Request a demo <Arrow />
        </a>
        <button
          ref={toggle}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <div className="nav-menu" id="nav-menu" ref={menu}>
        <nav aria-label="Menu">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Out href={webMap}>
            Live map <Arrow kind="out" />
          </Out>
        </nav>
      </div>
    </header>
  );
}
