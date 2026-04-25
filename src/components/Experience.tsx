import { Briefcase, ChevronRight, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import ScrollSection from './ScrollSection'

type ExperienceEntry = {
  year: number
  org: string
  location: string
  role: string
  period: string
  bullets: string[]
  tags: string[]
}

const experiences: ExperienceEntry[] = [
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

function getExperienceMeta(experience: ExperienceEntry) {
  return {
    isCurrent: experience.period.includes('Present'),
  }
}

type EnrichedExperience = ExperienceEntry & {
  meta: ReturnType<typeof getExperienceMeta>
}

const timeline = [...new Set(experiences.map((experience) => experience.year))]
  .sort((a, b) => b - a)
  .map((year) => {
    const groupsByOrganization = new Map<string, { org: string; roles: EnrichedExperience[] }>()
    const entries = experiences.filter((experience) => experience.year === year)

    entries.forEach((experience) => {
      const enrichedExperience: EnrichedExperience = {
        ...experience,
        meta: getExperienceMeta(experience),
      }

      if (!groupsByOrganization.has(experience.org)) {
        groupsByOrganization.set(experience.org, {
          org: experience.org,
          roles: [],
        })
      }

      groupsByOrganization.get(experience.org)?.roles.push(enrichedExperience)
    })

    const organizations = [...groupsByOrganization.values()].map((group) => {
      const uniqueLocations = [...new Set(group.roles.map((role) => role.location))]

      return {
        ...group,
        isCurrent: group.roles.some((role) => role.meta.isCurrent),
        isGrouped: group.roles.length > 1,
        locationLabel: uniqueLocations.join(' · '),
      }
    })

    return {
      year,
      organizations,
      currentCount: organizations.filter((organization) => organization.isCurrent).length,
    }
  })

export default function Experience() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <ScrollSection id="experience" className="section-shell bg-gray-900/20 py-20 sm:py-24" amount={0.12}>
      <div className="mx-auto max-w-6xl">
        <SectionHeader icon={<Briefcase className="h-4 w-4 text-indigo-400" />} title="Experience" />
        <p className="mb-8 max-w-3xl text-sm leading-7 text-gray-500 sm:mb-10 sm:text-base">
          Internships, leadership, and systems work in a cleaner timeline, with current roles highlighted
          and related positions grouped together.
        </p>

        <div className="space-y-16">
          {timeline.map((timelineYear) => (
            <motion.section
              key={timelineYear.year}
              className="md:grid md:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] md:gap-8"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative z-10 mb-5 md:mb-0 md:flex md:flex-col md:items-end md:pr-2 md:pt-1">
                <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-indigo-500/30 bg-gray-900 px-3 py-1.5 font-mono text-sm text-indigo-300 shadow-lg shadow-indigo-500/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  {timelineYear.year}
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-gray-600 md:max-w-[8rem] md:text-right">
                  {timelineYear.currentCount > 0
                    ? `${timelineYear.currentCount} current role${timelineYear.currentCount === 1 ? '' : 's'}`
                    : `${timelineYear.organizations.length} org${timelineYear.organizations.length === 1 ? '' : 's'}`}
                </p>
              </div>

              <div className="space-y-6 pl-5 md:pl-0">
                {timelineYear.organizations.map((organization, index) => (
                  <motion.article
                    key={`${timelineYear.year}-${organization.org}`}
                    className="relative md:grid md:grid-cols-[2.25rem_minmax(0,1fr)] md:gap-4"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.45,
                      delay: shouldReduceMotion ? 0 : index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="absolute left-0 top-8 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 md:static md:h-auto md:w-auto md:items-start md:justify-center md:pt-8">
                      <div
                        className={`h-3.5 w-3.5 rounded-full border-2 border-gray-950 shadow-lg ${
                          organization.isCurrent
                            ? 'bg-emerald-400 shadow-emerald-500/40'
                            : 'bg-indigo-500 shadow-indigo-500/40'
                        }`}
                      />
                    </div>

                    <div
                      className={`timeline-company-shell card-hover rounded-[1.75rem] border p-0 backdrop-blur-sm ${
                        organization.isCurrent
                          ? 'timeline-current border-emerald-400/30 bg-emerald-500/10'
                          : 'border-gray-800 bg-gray-900/70'
                      } ${organization.isGrouped ? 'timeline-company-group' : ''}`}
                    >
                      <div
                        className={`flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6 ${
                          organization.isCurrent ? 'border-emerald-400/15' : 'border-white/5'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{organization.org}</h3>
                            {organization.isGrouped && (
                              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                                Combined roles
                              </span>
                            )}
                            {organization.isCurrent && (
                              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                                Current
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-mono uppercase tracking-[0.24em] text-gray-500">
                            {organization.locationLabel}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            {organization.roles.length} role{organization.roles.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-5 sm:p-6">
                        {organization.roles.map((role) => (
                          <div
                            key={`${role.org}-${role.role}`}
                            className={`timeline-role-card rounded-2xl border p-4 sm:p-5 ${
                              organization.isCurrent && role.meta.isCurrent
                                ? 'border-emerald-400/20 bg-emerald-400/5'
                                : 'border-white/5 bg-gray-950/60'
                            }`}
                          >
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-base font-semibold text-white">{role.role}</p>
                                <p className="mt-1 text-sm text-gray-400">{role.location}</p>
                              </div>

                              <div className="flex flex-wrap gap-2 sm:max-w-[22rem] sm:justify-end">
                                {role.meta.isCurrent && (
                                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                                    Active now
                                  </span>
                                )}
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-gray-300">
                                  {role.period}
                                </span>
                              </div>
                            </div>

                            <ul className="mb-4 space-y-2.5">
                              {role.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-gray-400">
                                  <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="flex flex-wrap gap-2">
                              {role.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md border border-indigo-500/10 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
