import type { Habitacion, InternacionRequest, TrasladoRequest, EgresoRequest } from '../types/room'
import { apiClient } from './apiClient'

export const roomService = {
  getAll: (signal?: AbortSignal): Promise<Habitacion[]> =>
    apiClient.get<Habitacion[]>('/habitaciones', { signal }).then(r => r.data),

  internar: (data: InternacionRequest): Promise<void> =>
    apiClient.post(`/habitaciones/${data.idHabitacion}/internar`, {
      idPaciente: data.idPaciente,
      motivo: data.motivo,
      observaciones: data.observaciones,
    }).then(() => undefined),

  trasladar: (idInternacion: number, data: TrasladoRequest): Promise<void> =>
    apiClient.post(`/internaciones/${idInternacion}/trasladar`, data).then(() => undefined),

  egresar: (idInternacion: number, data: EgresoRequest): Promise<void> =>
    apiClient.post(`/internaciones/${idInternacion}/egresar`, data).then(() => undefined),

  cambiarEstado: (idHabitacion: number, estado: 'disponible' | 'mantenimiento'): Promise<void> =>
    apiClient.patch(`/habitaciones/${idHabitacion}/estado`, { estado }).then(() => undefined),
}
