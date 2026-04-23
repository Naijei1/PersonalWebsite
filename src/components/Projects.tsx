import { useEffect, useState } from 'react'
import { Rocket, Trophy, ChevronRight, ExternalLink, Star, X } from 'lucide-react'
import SectionHeader from './SectionHeader'

const projectImagePath = (fileName: string) => `${import.meta.env.BASE_URL}project-logos/${fileName}`

type Project = {
  name: string
  award: string | null
  period: string
  description: string
  bullets: string[]
  tags: string[]
  highlight: boolean
  link?: string
  org: string
  language: string
  stars?: number
  repoDescription?: string
  image?: string
}

const projects: Project[] = [
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
    link: 'https://github.com/Naijei1/GroovyAR',
    org: 'Cornell Makeathon',
    language: 'Python',
    stars: 0,
    repoDescription:
      'AR-assisted real-time drumming trainer that maps songs to timed 4-lane percussion cues.',
    image: projectImagePath('groovyar.png'),
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
    org: 'Astra',
    language: 'Python · React',
  },
  {
    name: 'HPC Compute Cluster',
    award: 'Cornell Data Science',
    period: 'Sep. 2025 – Dec. 2025',
    description:
      '6-node distributed system for AI workloads with Slurm scheduling, NFS storage, and real-time health monitoring.',
    bullets: [
      'Configured Slurm workload scheduling and NFS storage to enable parallel training across networked hardware.',
      'Built a real-time health dashboard to visualize cluster metrics (CPU/GPU usage, node status) and detect failures, significantly improving system observability and uptime.',
    ],
    tags: ['Slurm', 'NFS', 'Cloudflare', 'vLLM', 'Distributed Systems'],
    highlight: false,
    link: 'https://github.com/CornellDataScience/computecluster',
    org: 'Cornell Data Science',
    language: 'C++',
    stars: 2,
    repoDescription: 'CDS Compute Cluster.',
    image: projectImagePath('computecluster.png'),
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
    org: 'Cornell Data Science',
    language: 'Java',
    stars: 2,
    repoDescription:
      'LAN-first peer-to-peer distributed downloader for game/software installs and updates.',
    image: projectImagePath('distributed-downloader.png'),
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
    org: 'INFO 1998',
    language: 'Python',
    stars: 0,
    repoDescription:
      'Web based machine learning application for predicting diabetes risk using a user friendly interface.',
    image: projectImagePath('ml-final-web.png'),
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
    org: 'C-DIME x RIT',
    language: 'ShaderLab',
    stars: 0,
    repoDescription:
      'A virtual reality simulator on 3D bioprinting for education-effectiveness research.',
    image: projectImagePath('vr-bioprinting.png'),
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
    org: 'Personal Project',
    language: 'C#',
    stars: 0,
    repoDescription: 'A VR car game that simulates driving.',
    image: projectImagePath('cruisin-vr.png'),
  },
]

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!selectedProject) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null)
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedProject])

  const closeModal = () => setSelectedProject(null)

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Rocket className="w-4 h-4 text-indigo-400" />} title="Projects" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className={`relative flex flex-col bg-gray-900/60 border rounded-2xl p-6 card-hover ${
                project.highlight
                  ? 'border-indigo-500/30 glow-sm'
                  : 'border-gray-800'
              } cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedProject(project)
                }
              }}
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
                    onClick={(event) => event.stopPropagation()}
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
                {project.bullets.slice(0, 1).map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-gray-500 text-xs leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500/70 flex-shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
                <li className="text-xs text-indigo-300/80 font-medium mt-2">Click for details</li>
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

      {selectedProject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <button
            aria-label="Close project details"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950/95 p-6 sm:p-7 shadow-2xl">
            <button
              aria-label="Close"
              onClick={closeModal}
              className="absolute top-4 right-4 rounded-md border border-gray-700 p-1.5 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-10">
              <p className="text-indigo-300 text-xs uppercase tracking-widest mb-1">{selectedProject.org}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">{selectedProject.name}</h3>
              <p className="text-gray-500 text-xs font-mono mt-1">{selectedProject.period}</p>
              {selectedProject.award && (
                <p className="text-indigo-400 text-sm font-medium mt-1.5">{selectedProject.award}</p>
              )}
            </div>

            {selectedProject.image ? (
              <div className="mt-5 rounded-xl overflow-hidden border border-gray-800">
                <img
                  src={selectedProject.image}
                  alt={`${selectedProject.name} project preview`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-gray-800 bg-gray-900/60 p-6 flex items-center gap-3">
                <Rocket className="w-5 h-5 text-indigo-400" />
                <p className="text-sm text-gray-400">Project preview coming soon.</p>
              </div>
            )}

            <p className="mt-5 text-gray-300 leading-relaxed">{selectedProject.description}</p>
            {selectedProject.repoDescription && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{selectedProject.repoDescription}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2 py-1 rounded-md border border-gray-700 bg-gray-900 text-gray-300">
                Language: {selectedProject.language}
              </span>
              {selectedProject.stars !== undefined && (
                <span className="px-2 py-1 rounded-md border border-gray-700 bg-gray-900 text-gray-300 inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  {selectedProject.stars} stars
                </span>
              )}
            </div>

            <ul className="mt-5 space-y-3">
              {selectedProject.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm text-gray-300 leading-relaxed">
                  <ChevronRight className="w-4 h-4 text-indigo-400/90 flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-md bg-gray-900 text-gray-300 text-xs border border-gray-700/80"
                >
                  {tag}
                </span>
              ))}
            </div>

            {selectedProject.link && (
              <a
                href={selectedProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 hover:border-indigo-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Repository
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
