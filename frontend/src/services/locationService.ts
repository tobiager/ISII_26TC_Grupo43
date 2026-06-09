import { apiClient } from './apiClient'

export interface Provincia {
  id: number
  nombre: string
}

export interface Localidad {
  id: number
  nombre: string
  codigoPostal: number
  idProvincia: number
}

export interface ObraSocial {
  id: number
  nombre: string
}

export interface AdminUser {
  id: number
  email: string
  nombre: string
  apellido: string
  nombreCompleto: string
  iniciales: string
  rol: string
}

export const locationService = {
  getProvincias: (signal?: AbortSignal): Promise<Provincia[]> =>
    apiClient.get<Provincia[]>('/provincias', { signal }).then(r => r.data),

  getLocalidades: (provinciaId?: number, signal?: AbortSignal): Promise<Localidad[]> => {
    const params = provinciaId ? { provinciaId } : {}
    return apiClient.get<Localidad[]>('/localidades', { params, signal }).then(r => r.data)
  },

  getObrasSociales: (signal?: AbortSignal): Promise<ObraSocial[]> =>
    apiClient.get<ObraSocial[]>('/obras-sociales', { signal }).then(r => r.data),

  getUsuario: (id: number, signal?: AbortSignal): Promise<AdminUser> =>
    apiClient.get<AdminUser>(`/usuarios/${id}`, { signal }).then(r => r.data),

  getPerfil: (signal?: AbortSignal): Promise<AdminUser> =>
    apiClient.get<AdminUser>('/usuarios/perfil', { signal }).then(r => r.data),
}
