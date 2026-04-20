import axios from 'axios'
import type { Patient, PatientRequest } from '../types/patient'

const BASE = import.meta.env.VITE_API_URL ?? '/api'
const api = axios.create({ baseURL: BASE })

// Converts empty-string placeholders to null so the backend Integer fields deserialize correctly
function sanitize(data: PatientRequest): object {
  return {
    ...data,
    idLocalidad: data.idLocalidad === '' ? null : Number(data.idLocalidad),
    idObraSocial: data.idObraSocial === '' ? null : Number(data.idObraSocial),
  }
}

export const patientService = {
  getAll: (signal?: AbortSignal): Promise<Patient[]> =>
    api.get<Patient[]>('/pacientes', { signal }).then(r => r.data),

  getDeleted: (signal?: AbortSignal): Promise<Patient[]> =>
    api.get<Patient[]>('/pacientes/desactivados', { signal }).then(r => r.data),

  getById: (id: number, signal?: AbortSignal): Promise<Patient> =>
    api.get<Patient>(`/pacientes/${id}`, { signal }).then(r => r.data),

  create: (data: PatientRequest): Promise<Patient> =>
    api.post<Patient>('/pacientes', sanitize(data)).then(r => r.data),

  update: (id: number, data: PatientRequest): Promise<Patient> =>
    api.put<Patient>(`/pacientes/${id}`, sanitize(data)).then(r => r.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/pacientes/${id}`).then(() => undefined),

  restaurar: (id: number): Promise<void> =>
    api.patch(`/pacientes/${id}/restaurar`).then(() => undefined),
}


