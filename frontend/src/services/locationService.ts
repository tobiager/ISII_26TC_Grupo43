import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? '/api'
const api = axios.create({ baseURL: BASE })

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
    api.get<Provincia[]>('/provincias', { signal }).then(r => r.data),

  getLocalidades: (provinciaId?: number, signal?: AbortSignal): Promise<Localidad[]> => {
    const params = provinciaId ? { provinciaId } : {}
    return api.get<Localidad[]>('/localidades', { params, signal }).then(r => r.data)
  },

  getObrasSociales: (signal?: AbortSignal): Promise<ObraSocial[]> =>
    api.get<ObraSocial[]>('/obras-sociales', { signal }).then(r => r.data),

  getUsuario: (id: number, signal?: AbortSignal): Promise<AdminUser> =>
    api.get<AdminUser>(`/usuarios/${id}`, { signal }).then(r => r.data),

  getPerfil: (signal?: AbortSignal): Promise<AdminUser> =>
    api.get<AdminUser>('/usuarios/perfil', { signal }).then(r => r.data),
}
