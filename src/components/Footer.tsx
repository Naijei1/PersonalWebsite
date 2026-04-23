export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-gray-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <p>
          Built by{' '}
          <span className="text-indigo-400 font-medium">Naijei Jiang</span> · React + Vite + Tailwind
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Naijei1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <a href="mailto:nj277@cornell.edu" className="hover:text-gray-400 transition-colors">
            nj277@cornell.edu
          </a>
        </div>
      </div>
    </footer>
  )
}
