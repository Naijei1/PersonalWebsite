import { Briefcase, ChevronRight } from 'lucide-react'
import SectionHeader from './SectionHeader'

const experiences = [
  {
    org: 'Cornell Data Science',
    location: 'Ithaca, NY',
    role: 'Technical Chair (Elected) · Data Engineering Technical Lead',
    period: 'Sep. 2025 – Present',
    bullets: [
      'Maintained the team\'s distributed compute infrastructure and project team website, managing resource allocation and job scheduling to support parallel model training across multiple subteams.',
      'Leading a 7-person team to build a distributed downloader, designing a peer-to-peer, chunked transfer workflow with integrity checks to speed up large file distribution and reduce origin server load.',
    ],
    tags: ['Distributed Systems', 'Job Scheduling', 'P2P', 'Infrastructure'],
  },
  {
    org: 'Cornell Bowers CIS',
    location: 'Ithaca, NY',
    role: 'Teaching Assistant · CS 2110: Data Structures and Algorithms',
    period: 'Aug. 2025 – Present',
    bullets: [
      'Led discussion sections for 34 students in a 300+ student course, guiding the class through implementation strategies for large-scale Java projects involving graph traversal, concurrency, and Swing GUIs.',
      'Maintained CS 2110 course website; cut render time from ~5–10s to <1s by optimizing image rendering and delivery.',
    ],
    tags: ['Java', 'Algorithms', 'Web Optimization', 'Teaching'],
  },
  {
    org: 'Cornell WebDev',
    location: 'Ithaca, NY',
    role: 'Backend Software Engineer',
    period: 'Jan. 2025 – May 2025',
    bullets: [
      'Refactored legacy backend code using MongoDB and SQL, optimizing query performance and data handling for the production student management system.',
      'Resolved 15+ critical logic errors, including authentication failures and rendering bugs, ensuring 99% uptime.',
    ],
    tags: ['MongoDB', 'SQL', 'Backend', 'Node.js'],
  },
  {
    org: 'C-DIME Computer Systems Lab',
    location: 'Rochester, NY',
    role: 'Lead Software Engineer',
    period: 'Aug. 2022 – Aug. 2024',
    bullets: [
      'Led and mentored a 4-person team, running sprints and delegating tasks to ship a VR prototype tested by 20+ users.',
      'Built core VR systems in Unity including input handling and interaction logic.',
    ],
    tags: ['Unity', 'C#', 'VR', 'Team Lead'],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 bg-gray-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Briefcase className="w-4 h-4 text-indigo-400" />} title="Experience" />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-gray-700 to-transparent hidden md:block" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <div key={i} className="md:pl-12 relative">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-6 w-3 h-3 rounded-full bg-indigo-500 border-2 border-gray-950 shadow-lg shadow-indigo-500/50 hidden md:block" />

                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 card-hover">
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
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3 text-gray-400 text-sm leading-relaxed">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
