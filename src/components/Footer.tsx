export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-8 text-sm text-ink-faint dark:border-white/[0.06] dark:text-night-soft">
      <div className="shell flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Naijei Jiang · Built with React, Three.js & Tailwind</p>
        <p title="↑ ↑ ↓ ↓ ← → ← → B A">Psst: the Konami code still works here.</p>
      </div>
    </footer>
  )
}
