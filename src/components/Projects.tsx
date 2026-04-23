import { Rocket, Trophy, ChevronRight } from 'lucide-react'
import SectionHeader from './SectionHeader'

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
  {
    name: 'Distributed Downloader',
    award: 'Cornell Data Science',
    period: '2026',
    description:
      'Peer-to-peer chunked file distribution system designed to accelerate large file downloads and reduce origin bandwidth usage.',
    bullets: [
      'Implemented chunk-based transfer coordination with integrity verification to improve reliability over unstable peers.',
      'Designed downloader orchestration for concurrent multi-peer retrieval to increase throughput and reduce total download time.',
    ],
    tags: ['Python', 'P2P', 'Distributed Systems', 'Concurrency', 'Networking'],
    highlight: false,
    link: 'https://github.com/CornellDataScience/distributed-downloader',
  },
  {
    name: 'ML Final Web',
    award: null,
    period: '2025',
    description:
      'Web-based machine learning application for predicting diabetes risk through an accessible, user-friendly interface.',
    bullets: [
      'Built a full prediction workflow from form capture to model inference and clear results presentation.',
    ],
    tags: ['Python', 'Machine Learning', 'Web App'],
    highlight: false,
    link: 'https://github.com/Naijei1/ML-Final-Web',
  },
  {
    name: 'VR Bioprinting Research Project',
    award: null,
    period: '2023',
    description:
      'Virtual reality simulation exploring 3D bioprinting concepts for education research in collaboration with RIT.',
    bullets: [
      'Developed immersive educational interactions and evaluated usability in a research-focused learning environment.',
    ],
    tags: ['Unity', 'C#', 'VR', 'Research'],
    highlight: false,
    link: 'https://github.com/Naijei1/VR-Bioprinting-Research-Project',
  },
  {
    name: 'Cruisin VR',
    award: null,
    period: '2023',
    description: 'A VR driving simulator game focused on vehicle handling and player immersion.',
    bullets: ['Implemented gameplay systems and interactions to deliver a polished VR driving experience.'],
    tags: ['Unity', 'C#', 'VR', 'Game Development'],
    highlight: false,
    link: 'https://github.com/Naijei1/Cruisin-VR',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Rocket className="w-4 h-4 text-indigo-400" />} title="Projects" />

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
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View on GitHub
                  </a>
                )}
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
