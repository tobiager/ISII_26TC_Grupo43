import type { Patient, PatientRequest } from '../types/patient'
import { apiClient } from './apiClient'

function sanitize(data: PatientRequest): object {
  return {
    ...data,
    idLocalidad: data.idLocalidad === '' ? null : Number(data.idLocalidad),
    idObraSocial: data.idObraSocial === '' ? null : Number(data.idObraSocial),
    numeroDireccion: data.numeroDireccion === '' ? null : Number(data.numeroDireccion),
    piso: data.piso === '' ? null : Number(data.piso),
    fechaVencimientoAfiliacion: data.fechaVencimientoAfiliacion || null,
    tipoTelefono: data.tipoTelefono || null,
    tipoResidencia: data.tipoResidencia || null,
    antecedentesText: data.antecedentesText || null,
  }
}

export const patientService = {
  getAll: (signal?: AbortSignal): Promise<Patient[]> =>
    apiClient.get<Patient[]>('/pacientes', { signal }).then(r => r.data),

  getDeleted: (signal?: AbortSignal): Promise<Patient[]> =>
    apiClient.get<Patient[]>('/pacientes/desactivados', { signal }).then(r => r.data),

  getById: (id: number, signal?: AbortSignal): Promise<Patient> =>
    apiClient.get<Patient>(`/pacientes/${id}`, { signal }).then(r => r.data),

  create: (data: PatientRequest): Promise<Patient> =>
    apiClient.post<Patient>('/pacientes', sanitize(data)).then(r => r.data),

  update: (id: number, data: PatientRequest): Promise<Patient> =>
    apiClient.put<Patient>(`/pacientes/${id}`, sanitize(data)).then(r => r.data),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/pacientes/${id}`).then(() => undefined),

  restaurar: (id: number): Promise<void> =>
    apiClient.patch(`/pacientes/${id}/restaurar`).then(() => undefined),

  checkDni: (dni: number, excluirId?: number): Promise<boolean> =>
    apiClient.get<{ existe: boolean }>('/pacientes/existe-dni', {
      params: { dni, ...(excluirId ? { excluirId } : {}) },
    }).then(r => r.data.existe),

  checkAfiliado: (nroAfiliado: string, idObraSocial?: number, nombreObraSocial?: string, excluirId?: number): Promise<boolean> =>
    apiClient.get<{ existe: boolean }>('/pacientes/existe-afiliado', {
      params: {
        nroAfiliado,
        ...(idObraSocial ? { idObraSocial } : {}),
        ...(nombreObraSocial ? { nombreObraSocial } : {}),
        ...(excluirId ? { excluirId } : {})
      },
    }).then(r => r.data.existe),
}
