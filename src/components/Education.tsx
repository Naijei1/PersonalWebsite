import { GraduationCap, BookOpen } from 'lucide-react'

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
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Education</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent ml-4" />
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 card-hover glow-sm">
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
            <div className="text-right">
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
    </section>
  )
}
