import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: number
  label: string
  iconBgColor: string
  iconColor: string
}

export default function StatCard({ icon: Icon, value, label, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconBgColor}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
