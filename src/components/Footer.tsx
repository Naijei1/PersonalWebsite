export default function Footer() {
  return (
    <footer className="border-t border-gray-900 px-6 py-8">
      <div className="page-shell mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-gray-600 md:flex-row md:text-left">
        <p className="leading-relaxed">
          Built by{' '}
          <span className="text-indigo-400 font-medium">Naijei Jiang</span> · React + Vite + Tailwind
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
          <a
            href="https://github.com/Naijei1"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target inline-flex items-center hover:text-gray-400 transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="mailto:nj277@cornell.edu"
            className="touch-target inline-flex items-center hover:text-gray-400 transition-colors"
          >
            nj277@cornell.edu
          </a>
        </div>
      </div>
    </footer>
  )
}
