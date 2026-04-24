import { Briefcase, ChevronRight, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import SectionHeader from './SectionHeader'

const experiences = [
  {
    year: 2026,
    org: 'GEICO',
    location: 'New York City Metropolitan Area',
    role: 'Incoming SWE Intern',
    period: 'Feb. 2026 – Present',
    bullets: [
      'Incoming software engineering intern focused on building production-ready features and reliable internal tooling.',
    ],
    tags: ['Software Engineering', 'Internship', 'Backend'],
  },
  {
    year: 2025,
    org: 'Cornell Data Science',
    location: 'Ithaca, NY',
    role: 'Technical Chair (Elected) · Data Engineering Technical Lead',
    period: 'Sep. 2025 – Present',
    bullets: [
      'Leading a 7-person team to build a distributed downloader, designing a peer-to-peer, chunked transfer workflow with integrity checks to speed up large file distribution and reduce origin server load.',
      'Designed a 6-node distributed system for AI workloads, configuring Slurm scheduling and NFS storage for parallel training across networked hardware.',
      'Built a real-time health dashboard to visualize CPU/GPU usage and node status, improving cluster observability and uptime.',
    ],
    tags: ['Distributed Systems', 'Job Scheduling', 'P2P', 'Infrastructure'],
  },
  {
    year: 2025,
    org: 'Cornell Bowers CIS',
    location: 'Ithaca, NY',
    role: 'Teaching Assistant · CS 2110: Data Structures and Algorithms',
    period: 'Aug. 2025 – Present',
    bullets: [
      'Facilitated discussion sections for 34 students in a 300+ student course, guiding implementations for large Java projects involving graph traversal, concurrency, and Swing GUIs.',
      'Mentored students on JUnit testing and asymptotic complexity analysis to ensure code efficiency and correctness.',
    ],
    tags: ['Java', 'Algorithms', 'Web Optimization', 'Teaching'],
  },
  {
    year: 2025,
    org: 'Cornell Bowers CIS',
    location: 'Ithaca, NY',
    role: 'CSMore Intern',
    period: 'Jul. 2025 – Aug. 2025',
    bullets: [
      'Participated in a selective summer program exploring advanced CS topics, including functional programming, RISC-V architecture, and low-level systems programming.',
      'Built hands-on systems workflows with Docker, Git, and terminal-driven development.',
    ],
    tags: ['Systems Programming', 'RISC-V', 'Functional Programming', 'Docker'],
  },
  {
    year: 2025,
    org: 'Cornell WebDev',
    location: 'Ithaca, New York, United States',
    role: 'Back End Developer',
    period: 'Jan. 2025 – May 2025',
    bullets: [
      'Learned MongoDB and applied it to an existing backend codebase to improve data handling and system performance.',
      'Resolved critical backend bugs, including login failures, crashes during logout/app exit, and avatar rendering issues.',
    ],
    tags: ['MongoDB', 'SQL', 'Backend', 'Node.js'],
  },
  {
    year: 2024,
    org: 'C-DIME Computer Systems Lab',
    location: 'Rochester, NY',
    role: 'Lead Software Engineer',
    period: 'Aug. 2022 – Sep. 2024',
    bullets: [
      'Led and mentored a 4-person team, running sprints and delegating tasks to ship a VR prototype tested by 20+ users.',
      'Designed and animated 3D assets in Blender while implementing core VR controls to improve interactivity.',
    ],
    tags: ['Unity', 'C#', 'VR', 'Team Lead'],
  },
  {
    year: 2023,
    org: 'Rochester Institute of Technology',
    location: 'Rochester, New York, United States',
    role: 'Software Developer Intern',
    period: 'Jul. 2023 – Aug. 2023',
    bullets: [
      'Developed a laser processing framework that improved runtime prediction accuracy to ~2% error rate.',
      'Improved position read cycle to 25 ms and fixed stop-button freezing via direct TCP stop commands.',
    ],
    tags: ['C#', 'Performance Optimization', 'TCP', 'Manufacturing Software'],
  },
]

const years = [...new Set(experiences.map((exp) => exp.year))].sort((a, b) => b - a)

export default function Experience() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="experience" className="py-24 px-6 bg-gray-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Briefcase className="w-4 h-4 text-indigo-400" />} title="Experience" />
        <p className="text-gray-500 mb-10 max-w-3xl">
          A year-based journey through internships, leadership, and systems work. Scroll down to
          follow the timeline.
        </p>

        <div className="relative pl-0 md:pl-16">
          <div className="hidden md:block absolute left-8 top-3 bottom-3 w-px bg-gradient-to-b from-indigo-400/80 via-purple-500/50 to-transparent" />

          <div className="space-y-14">
            {years.map((year) => {
              const entries = experiences.filter((exp) => exp.year === year)
              return (
                <motion.div
                  key={year}
                  className="relative"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-5 md:mb-0 md:absolute md:-left-2 md:w-20 md:top-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-indigo-500/30 text-indigo-300 text-sm font-mono shadow-lg shadow-indigo-500/10">
                      <Sparkles className="w-3.5 h-3.5" />
                      {year}
                    </div>
                  </div>

                  <div className="space-y-6 md:pl-10">
                    {entries.map((exp, i) => (
                      <motion.div
                        key={`${exp.org}-${exp.role}`}
                        className="relative"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{
                          duration: 0.45,
                          delay: shouldReduceMotion ? 0 : i * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <div className="hidden md:block absolute -left-[38px] top-8 w-4 h-4 rounded-full bg-indigo-500 border-2 border-gray-950 shadow-lg shadow-indigo-500/40" />

                        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 card-hover timeline-card backdrop-blur-sm">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white">{exp.org}</h3>
                              <p className="text-indigo-400 text-sm font-medium mt-0.5">{exp.role}</p>
                            </div>
                            <div className="text-left md:text-right flex-shrink-0">
                              <p className="text-gray-500 text-xs font-mono">{exp.period}</p>
                              <p className="text-gray-600 text-xs mt-0.5">{exp.location}</p>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-4">
                            {exp.bullets.map((b) => (
                              <li key={b} className="flex gap-3 text-gray-400 text-sm leading-relaxed">
                                <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex flex-wrap gap-2">
                            {exp.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/10"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
