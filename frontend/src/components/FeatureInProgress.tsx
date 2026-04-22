import React from 'react'
import { toast } from 'sonner'

interface FeatureInProgressProps {
  children: React.ReactNode
  featureName?: string
  className?: string
}

export default function FeatureInProgress({ children, featureName, className = '' }: FeatureInProgressProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const mensaje = featureName 
      ? `¡Estamos trabajando en esto! La función de ${featureName} estará disponible en el próximo Sprint.`
      : '¡Estamos trabajando en esto! Esta función estará disponible en el próximo Sprint.'
      
    toast.info('Funcionalidad en desarrollo', {
      description: mensaje,
      duration: 3500,
    })
  }

  return (
    <div 
      onClick={handleClick} 
      className={`opacity-50 cursor-not-allowed hover:opacity-60 transition-all inline-block ${className}`}
      title="Próximamente"
    >
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  )
}
