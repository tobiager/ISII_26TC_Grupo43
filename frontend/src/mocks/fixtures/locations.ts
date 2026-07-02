import type { Provincia, Localidad, ObraSocial } from '../../services/locationService'

export const MOCK_PROVINCIAS: Provincia[] = [
  { id: 1, nombre: 'Buenos Aires' },
  { id: 2, nombre: 'Ciudad Autónoma de Buenos Aires' },
  { id: 3, nombre: 'Córdoba' },
  { id: 4, nombre: 'Corrientes' },
  { id: 5, nombre: 'Santa Fe' },
  { id: 6, nombre: 'Chaco' },
]

export const MOCK_LOCALIDADES: Localidad[] = [
  { id: 1, nombre: 'La Plata', codigoPostal: 1900, idProvincia: 1 },
  { id: 2, nombre: 'Mar del Plata', codigoPostal: 7600, idProvincia: 1 },
  { id: 3, nombre: 'Palermo', codigoPostal: 1425, idProvincia: 2 },
  { id: 4, nombre: 'Recoleta', codigoPostal: 1112, idProvincia: 2 },
  { id: 5, nombre: 'Córdoba Capital', codigoPostal: 5000, idProvincia: 3 },
  { id: 6, nombre: 'Villa Carlos Paz', codigoPostal: 5152, idProvincia: 3 },
  { id: 7, nombre: 'Corrientes Capital', codigoPostal: 3400, idProvincia: 4 },
  { id: 8, nombre: 'Goya', codigoPostal: 3450, idProvincia: 4 },
  { id: 9, nombre: 'Rosario', codigoPostal: 2000, idProvincia: 5 },
  { id: 10, nombre: 'Santa Fe Capital', codigoPostal: 3000, idProvincia: 5 },
  { id: 11, nombre: 'Resistencia', codigoPostal: 3500, idProvincia: 6 },
  { id: 12, nombre: 'Villa Ángela', codigoPostal: 3540, idProvincia: 6 },
]

export const MOCK_OBRAS_SOCIALES: ObraSocial[] = [
  { id: 1, nombre: 'Sin obra social' },
  { id: 2, nombre: 'OSDE' },
  { id: 3, nombre: 'Swiss Medical' },
  { id: 4, nombre: 'Galeno' },
  { id: 5, nombre: 'Medifé' },
  { id: 6, nombre: 'Sancor Salud' },
  { id: 7, nombre: 'IOMA' },
  { id: 8, nombre: 'PAMI' },
]

export function localidadNombre(id: number | null): string | null {
  return MOCK_LOCALIDADES.find(l => l.id === id)?.nombre ?? null
}

export function provinciaDeLocalidad(idLocalidad: number | null): { id: number | null; nombre: string | null } {
  const loc = MOCK_LOCALIDADES.find(l => l.id === idLocalidad)
  if (!loc) return { id: null, nombre: null }
  const prov = MOCK_PROVINCIAS.find(p => p.id === loc.idProvincia)
  return { id: prov?.id ?? null, nombre: prov?.nombre ?? null }
}

export function obraSocialNombre(id: number | null): string | null {
  return MOCK_OBRAS_SOCIALES.find(o => o.id === id)?.nombre ?? null
}
