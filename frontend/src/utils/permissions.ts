import type { Rol } from '../types/auth'

export const canViewPatients      = (_role: Rol) => true
export const canEditPatients      = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ADMINISTRATIVO'
export const canDeletePatients    = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ADMINISTRATIVO'

export const canViewRooms         = (_role: Rol) => true
export const canAdmitPatient      = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ENFERMERO'
export const canTransferPatient   = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ENFERMERO'
export const canDischargePatient  = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ENFERMERO'
export const canManageRooms       = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ENFERMERO'
export const canChangeRoomStatus  = (role: Rol) => role === 'ADMINISTRADOR' || role === 'ENFERMERO'

export const canViewMedicalHistory  = (_role: Rol) => true
export const canEditMedicalHistory  = (role: Rol) => role === 'ADMINISTRADOR' || role === 'MEDICO' || role === 'ENFERMERO'

export const canAccessAdmin = (role: Rol) => role === 'ADMINISTRADOR'

export const ROLE_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  ADMINISTRATIVO: 'Administrativo',
  MEDICO: 'Médico',
  ENFERMERO: 'Enfermero',
}
