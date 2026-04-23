import { Rocket, Trophy, ChevronRight } from 'lucide-react'

const projects = [
  {
    name: 'GroovyAR',
    award: '1st Place Overall · Cornell Makeathon',
    period: 'Feb. 2026',
    description:
      'AR-assisted real-time drumming trainer that maps songs to timed 4-lane percussion cues. Won 1st place overall at Cornell Makeathon (150+ participants, ASML-sponsored).',
    bullets: [
      'Engineered a low-latency pipeline by preprocessing MP3s into timestamped JSON events (librosa), streaming cues over WebSockets, and anchoring UI with ArUco tracking (OpenCV).',
    ],
    tags: ['Python', 'Flask', 'React', 'OpenCV', 'Librosa', 'Raspberry Pi', 'WebSockets'],
    highlight: true,
  },
  {
    name: 'Astra',
    award: 'Founding Engineer',
    period: 'Jan. 2026 – Feb. 2026',
    description:
      'AI-powered agent platform with MCP server integration, cutting end-to-end response time from ~10s to ~5s.',
    bullets: [
      'Built and optimized an MCP server for Astra\'s agent workflows, refactored legacy model code to the new Gemini SDK.',
      'Integrated the backend with the Canvas API and shipped React-facing features; built a file upload and processing pipeline and fixed intent routing to improve tool-call accuracy.',
    ],
    tags: ['Flask', 'Python', 'Gemini API', 'React', 'Canvas API', 'MCP'],
    highlight: false,
  },
  {
    name: 'HPC Compute Cluster',
    award: null,
    period: 'Sep. 2025 – Dec. 2025',
    description:
      '6-node distributed system for AI workloads with Slurm scheduling, NFS storage, and real-time health monitoring.',
    bullets: [
      'Configured Slurm workload scheduling and NFS storage to enable parallel training across networked hardware.',
      'Built a real-time health dashboard to visualize cluster metrics (CPU/GPU usage, node status) and detect failures, significantly improving system observability and uptime.',
    ],
    tags: ['Slurm', 'NFS', 'Cloudflare', 'vLLM', 'Distributed Systems'],
    highlight: false,
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent ml-4" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <div
              key={i}
              className={`relative flex flex-col bg-gray-900/60 border rounded-2xl p-6 card-hover ${
                project.highlight
                  ? 'border-indigo-500/30 glow-sm'
                  : 'border-gray-800'
              }`}
            >
              {project.highlight && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-semibold">1st Place</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-0.5">{project.name}</h3>
                {project.award && !project.highlight && (
                  <p className="text-indigo-400 text-xs font-medium">{project.award}</p>
                )}
                <p className="text-gray-600 text-xs font-mono mt-1">{project.period}</p>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {project.description}
              </p>

              <ul className="space-y-2 mb-6 flex-1">
                {project.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-gray-500 text-xs leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500/70 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-400 text-xs border border-gray-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
