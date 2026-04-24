import { type ReactNode } from 'react'

type SectionHeaderProps = {
  icon: ReactNode
  title: string
  className?: string
}

export default function SectionHeader({ icon, title, className = 'mb-12' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 sm:flex-nowrap ${className}`.trim()}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
        {icon}
      </div>
      <h2 className="min-w-0 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <div className="h-px min-w-[5rem] flex-1 bg-gradient-to-r from-gray-800 to-transparent sm:ml-4" />
    </div>
  )
}
