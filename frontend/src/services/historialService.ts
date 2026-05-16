import type { HistorialMedicoDetalle, RegistroClinicoRequest, TipoProcedimiento } from '../types/history'
import { apiClient } from './apiClient'

export const historialService = {
  getByPaciente: (idPaciente: number, signal?: AbortSignal): Promise<HistorialMedicoDetalle> =>
    apiClient.get<HistorialMedicoDetalle>(`/historial/${idPaciente}`, { signal }).then(r => r.data),

  getTiposProcedimiento: (signal?: AbortSignal): Promise<TipoProcedimiento[]> =>
    apiClient.get<TipoProcedimiento[]>('/historial/tipos-procedimiento', { signal }).then(r => r.data),

  registrarEvento: (data: RegistroClinicoRequest): Promise<void> =>
    apiClient.post(`/historial/${data.idPaciente}/registros`, {
      idTipoProcedimiento: data.idTipoProcedimiento,
      descripcion: data.descripcion,
    }).then(() => undefined),
}
