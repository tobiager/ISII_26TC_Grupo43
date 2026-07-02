import type { Patient } from '../types/patient'
import type { Habitacion } from '../types/room'
import type { HistorialMedicoDetalle } from '../types/history'
import {
  MOCK_PATIENTS,
  MOCK_ROOMS,
  MOCK_HISTORIAL,
  MOCK_TIPOS_PROCEDIMIENTO,
  MOCK_PROVINCIAS,
  MOCK_LOCALIDADES,
  MOCK_OBRAS_SOCIALES,
  MOCK_ADMIN_USUARIOS,
} from './fixtures'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

// Store en memoria: se re-crea desde las fixtures cada vez que el módulo se importa
// (es decir, en cada carga completa de página), así una recarga "resetea" la demo.
export const store = {
  patients: clone(MOCK_PATIENTS) as Patient[],
  deletedPatients: [] as Patient[],
  rooms: clone(MOCK_ROOMS) as Habitacion[],
  historial: clone(MOCK_HISTORIAL) as Record<number, HistorialMedicoDetalle>,
  tiposProcedimiento: clone(MOCK_TIPOS_PROCEDIMIENTO),
  provincias: clone(MOCK_PROVINCIAS),
  localidades: clone(MOCK_LOCALIDADES),
  obrasSociales: clone(MOCK_OBRAS_SOCIALES),
  adminUsuarios: clone(MOCK_ADMIN_USUARIOS),
  nextPatientId: Math.max(...MOCK_PATIENTS.map(p => p.id)) + 1,
  nextRegistroId: 1000,
  nextInternacionId: 2000,
}
