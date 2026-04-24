import { Briefcase, ChevronRight, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import ScrollSection from './ScrollSection'

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
    <ScrollSection id="experience" className="section-shell py-20 sm:py-24 bg-gray-900/20" amount={0.12}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Briefcase className="w-4 h-4 text-indigo-400" />} title="Experience" />
        <p className="mb-8 max-w-3xl text-sm leading-7 text-gray-500 sm:mb-10 sm:text-base">
          A year-based journey through internships, leadership, and systems work. Scroll down to
          follow the timeline.
        </p>

        <div className="space-y-14">
          {years.map((year) => {
            const entries = experiences.filter((exp) => exp.year === year)
            return (
              <motion.div
                key={year}
                className="md:grid md:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] md:gap-x-0"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative z-10 mb-4 md:mb-0 md:flex md:justify-end md:pr-5 md:pt-1.5">
                  <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-indigo-500/30 bg-gray-900 px-3 py-1.5 font-mono text-sm text-indigo-300 shadow-lg shadow-indigo-500/10">
                    <Sparkles className="w-3.5 h-3.5" />
                    {year}
                  </div>
                </div>

                <div className="space-y-6">
                  {entries.map((exp, i) => (
                    <motion.div
                      key={`${exp.org}-${exp.role}`}
                      className="relative pl-5 before:absolute before:bottom-0 before:left-[0.4375rem] before:top-0 before:w-px before:bg-gradient-to-b before:from-indigo-400/70 before:via-purple-500/40 before:to-transparent before:content-[''] md:grid md:grid-cols-[2.5rem_minmax(0,1fr)] md:pl-0 md:before:left-5 md:before:-translate-x-1/2"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{
                        duration: 0.45,
                        delay: shouldReduceMotion ? 0 : i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="absolute left-0 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 md:static md:flex md:items-start md:justify-center md:pt-7">
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-950 bg-indigo-500 shadow-lg shadow-indigo-500/40" />
                      </div>

                      <div className="timeline-card card-hover rounded-2xl border border-gray-800 bg-gray-900/70 p-5 backdrop-blur-sm sm:p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white sm:text-lg">{exp.org}</h3>
                            <p className="mt-0.5 text-sm font-medium text-indigo-400">{exp.role}</p>
                          </div>
                          <div className="flex-shrink-0 text-left sm:text-right">
                            <p className="text-xs font-mono text-gray-500">{exp.period}</p>
                            <p className="mt-0.5 text-xs text-gray-600">{exp.location}</p>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {exp.bullets.map((b) => (
                            <li key={b} className="flex gap-3 text-sm leading-relaxed text-gray-400">
                              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2">
                          {exp.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-indigo-500/10 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300"
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
    </ScrollSection>
  )
}
