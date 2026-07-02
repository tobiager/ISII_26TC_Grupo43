import type { Habitacion } from '../../types/room'
import { MOCK_PATIENTS } from './patients'

function ocupante(idPaciente: number) {
  const p = MOCK_PATIENTS.find(x => x.id === idPaciente)!
  return { id: p.id, nombreCompleto: p.nombreCompleto, dni: p.dni }
}

export const MOCK_ROOMS: Habitacion[] = [
  { id: 1, numeroHabitacion: '101', pisoHabitacion: 1, estadoHabitacion: 'ocupada', pacienteActual: ocupante(2), internacionActual: { id: 1001, fechaInicio: '2026-06-27', cantidadTraslados: 0 } },
  { id: 2, numeroHabitacion: '102', pisoHabitacion: 1, estadoHabitacion: 'ocupada', pacienteActual: ocupante(4), internacionActual: { id: 1002, fechaInicio: '2026-06-29', cantidadTraslados: 1 } },
  { id: 3, numeroHabitacion: '103', pisoHabitacion: 1, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
  { id: 4, numeroHabitacion: '104', pisoHabitacion: 1, estadoHabitacion: 'mantenimiento', pacienteActual: null, internacionActual: null },
  { id: 5, numeroHabitacion: '201', pisoHabitacion: 2, estadoHabitacion: 'ocupada', pacienteActual: ocupante(6), internacionActual: { id: 1003, fechaInicio: '2026-06-20', cantidadTraslados: 0 } },
  { id: 6, numeroHabitacion: '202', pisoHabitacion: 2, estadoHabitacion: 'ocupada', pacienteActual: ocupante(9), internacionActual: { id: 1004, fechaInicio: '2026-06-30', cantidadTraslados: 0 } },
  { id: 7, numeroHabitacion: '203', pisoHabitacion: 2, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
  { id: 8, numeroHabitacion: '204', pisoHabitacion: 2, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
  { id: 9, numeroHabitacion: '301', pisoHabitacion: 3, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
  { id: 10, numeroHabitacion: '302', pisoHabitacion: 3, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
  { id: 11, numeroHabitacion: '303', pisoHabitacion: 3, estadoHabitacion: 'mantenimiento', pacienteActual: null, internacionActual: null },
  { id: 12, numeroHabitacion: '304', pisoHabitacion: 3, estadoHabitacion: 'disponible', pacienteActual: null, internacionActual: null },
]
