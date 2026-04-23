import { Code2, Zap } from 'lucide-react'
import SectionHeader from './SectionHeader'

const skillGroups = [
  {
    label: 'Languages',
    skills: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C#', 'SQL'],
  },
  {
    label: 'Frontend',
    skills: ['React', 'Vite', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    label: 'Backend & DB',
    skills: ['Flask', 'Node.js', 'PostgreSQL', 'MongoDB'],
  },
  {
    label: 'Systems & Infra',
    skills: ['Slurm', 'NFS', 'vLLM', 'Cloudflare', 'Linux', 'Distributed Systems'],
  },
  {
    label: 'ML & Data',
    skills: ['NumPy', 'OpenCV', 'Librosa', 'Gemini API', 'Machine Learning'],
  },
  {
    label: 'Tools',
    skills: ['Git', 'GitHub', 'Unity', 'WebSockets', 'MCP', 'Docker', 'RISC-V'],
  },
]

const interests = [
  'Distributed Systems',
  'Web Development',
  'Systems Programming',
  'Education',
  'Rock Climbing',
  'VR / AR',
  'AI Infrastructure',
]

const topSkills = ['Data Structures', 'Mentoring', 'Tutoring']

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-gray-900/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<Code2 className="w-4 h-4 text-indigo-400" />} title="Skills" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 card-hover"
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-300 text-sm font-medium hover:border-indigo-500/30 hover:text-indigo-300 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-400">Top LinkedIn Skills</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {topSkills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-400">Interests</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 text-gray-300 text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
