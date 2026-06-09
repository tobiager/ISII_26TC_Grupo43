import { Lock } from 'lucide-react'

export default function ReadOnlyBadge({ message }: { message?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium"
      title={message ?? 'Solo lectura — tu rol no permite modificar esta sección.'}
    >
      <Lock size={11} />
      Solo lectura
    </span>
  )
}
