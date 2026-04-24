import { GraduationCap, BookOpen } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ScrollSection from './ScrollSection'

const courses = [
  'Data Structures & Algorithms',
  'Linear Algebra',
  'Machine Learning',
  'Data Science',
  'Object-Oriented Programming',
  'Discrete Mathematics',
  'Probability',
  'Computer Systems',
  'Computer Vision',
  'Functional Programming',
]

export default function Education() {
  return (
    <ScrollSection className="section-shell py-20 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={<GraduationCap className="w-4 h-4 text-indigo-400" />} title="Education" />

        <div className="card-hover glow-sm rounded-2xl border border-gray-800 bg-gray-900/50 p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Cornell University</h3>
              <p className="text-indigo-400 font-medium mt-1">
                Bachelor of Science in Computer Science
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                  GPA: 3.8 / 4.0
                </span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-gray-500 text-sm font-mono">Expected May 2028</p>
              <p className="text-gray-500 text-sm mt-1">Ithaca, NY</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400 font-medium">Relevant Coursework</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <span
                  key={course}
                  className="px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-300 text-xs font-medium hover:border-indigo-500/30 hover:text-indigo-300 transition-colors"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
