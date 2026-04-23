import { type ReactNode } from 'react'

type SectionHeaderProps = {
  icon: ReactNode
  title: string
  className?: string
}

export default function SectionHeader({ icon, title, className = 'mb-12' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent ml-4" />
    </div>
  )
}
