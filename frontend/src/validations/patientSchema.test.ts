import { describe, it, expect } from 'vitest'
import { patientSchema } from './patientSchema'

// ─── Datos base válidos ───────────────────────────────────────────────────────

const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)

const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const toDateStr = (d: Date) => d.toISOString().split('T')[0]

const validData = {
  nombre: 'Juan Carlos',
  apellido: 'Del Valle',
  dni: 12345678,
  fechaNacimiento: '1990-05-15',
  tipoSangre: 'A+',
  telefono: '1123456789',
  tipoTelefono: 'personal',
  direccion: 'Corrientes',
  numeroDireccion: 1234,
  piso: undefined,
  tipoResidencia: 'permanente',
  idProvincia: undefined,
  idLocalidad: 1,
  idObraSocial: '',
  nombreObraSocial: '',
  nroAfiliado: '',
  fechaVencimientoAfiliacion: '',
  antecedentesText: '',
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function errorPaths(data: object): string[] {
  const result = patientSchema.safeParse(data)
  if (result.success) return []
  return result.error.issues.map((e) => e.path.join('.'))
}

function errorMessages(data: object, field: string): string[] {
  const result = patientSchema.safeParse(data)
  if (result.success) return []
  return result.error.issues
    .filter((e) => e.path.join('.') === field)
    .map((e) => e.message)
}

// ─── Caso base ────────────────────────────────────────────────────────────────

describe('patientSchema — datos válidos', () => {
  it('acepta todos los campos correctamente completados', () => {
    const result = patientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

// ─── Datos personales ─────────────────────────────────────────────────────────

describe('nombre', () => {
  it('rechaza campo vacío', () => {
    expect(errorPaths({ ...validData, nombre: '' })).toContain('nombre')
  })

  it('rechaza nombre con números', () => {
    expect(errorPaths({ ...validData, nombre: 'Juan123' })).toContain('nombre')
  })

  it('acepta nombre con tildes y ñ', () => {
    const result = patientSchema.safeParse({ ...validData, nombre: 'Sofía' })
    expect(result.success).toBe(true)
  })
})

describe('apellido', () => {
  it('rechaza campo vacío', () => {
    expect(errorPaths({ ...validData, apellido: '' })).toContain('apellido')
  })
})

describe('dni', () => {
  it('rechaza DNI vacío (0)', () => {
    expect(errorPaths({ ...validData, dni: 0 })).toContain('dni')
  })

  it('rechaza DNI con menos de 7 dígitos', () => {
    expect(errorPaths({ ...validData, dni: 123456 })).toContain('dni')
  })

  it('rechaza DNI con más de 8 dígitos', () => {
    expect(errorPaths({ ...validData, dni: 100000000 })).toContain('dni')
  })

  it('acepta DNI de 7 dígitos', () => {
    const result = patientSchema.safeParse({ ...validData, dni: 1000000 })
    expect(result.success).toBe(true)
  })

  it('acepta DNI de 8 dígitos', () => {
    const result = patientSchema.safeParse({ ...validData, dni: 99999999 })
    expect(result.success).toBe(true)
  })
})

// ─── Fecha de nacimiento ──────────────────────────────────────────────────────

describe('fechaNacimiento', () => {
  it('rechaza campo vacío', () => {
    expect(errorPaths({ ...validData, fechaNacimiento: '' })).toContain('fechaNacimiento')
  })

  it('rechaza fecha de hoy', () => {
    expect(errorPaths({ ...validData, fechaNacimiento: toDateStr(today) })).toContain('fechaNacimiento')
  })

  it('rechaza fecha futura', () => {
    expect(errorPaths({ ...validData, fechaNacimiento: toDateStr(tomorrow) })).toContain('fechaNacimiento')
  })

  it('acepta fecha en el pasado', () => {
    const result = patientSchema.safeParse({ ...validData, fechaNacimiento: '1990-01-01' })
    expect(result.success).toBe(true)
  })
})

// ─── Dirección ────────────────────────────────────────────────────────────────

describe('numeroDireccion', () => {
  it('rechaza valor 0 (campo vacío/no ingresado)', () => {
    expect(errorPaths({ ...validData, numeroDireccion: 0 })).toContain('numeroDireccion')
  })

  it('rechaza valor negativo', () => {
    expect(errorPaths({ ...validData, numeroDireccion: -5 })).toContain('numeroDireccion')
  })

  it('acepta valor positivo', () => {
    const result = patientSchema.safeParse({ ...validData, numeroDireccion: 1 })
    expect(result.success).toBe(true)
  })
})

describe('piso', () => {
  it('acepta campo ausente (undefined)', () => {
    const result = patientSchema.safeParse({ ...validData, piso: undefined })
    expect(result.success).toBe(true)
  })

  it('acepta campo vacío como string (se convierte a undefined)', () => {
    const result = patientSchema.safeParse({ ...validData, piso: '' })
    expect(result.success).toBe(true)
  })

  it('rechaza piso = 0', () => {
    expect(errorPaths({ ...validData, piso: 0 })).toContain('piso')
  })

  it('rechaza piso negativo (-1)', () => {
    const msgs = errorMessages({ ...validData, piso: -1 }, 'piso')
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]).toContain('positivo')
  })

  it('acepta piso positivo', () => {
    const result = patientSchema.safeParse({ ...validData, piso: 3 })
    expect(result.success).toBe(true)
  })
})

// ─── Fecha de vencimiento de afiliación ───────────────────────────────────────

describe('fechaVencimientoAfiliacion', () => {
  it('acepta campo vacío (opcional)', () => {
    const result = patientSchema.safeParse({ ...validData, fechaVencimientoAfiliacion: '' })
    expect(result.success).toBe(true)
  })

  it('rechaza fecha de ayer', () => {
    const msgs = errorMessages(
      { ...validData, fechaVencimientoAfiliacion: toDateStr(yesterday) },
      'fechaVencimientoAfiliacion',
    )
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]).toContain('posterior')
  })

  it('rechaza fecha de hoy (la alta es hoy, vencimiento debe ser posterior)', () => {
    const msgs = errorMessages(
      { ...validData, fechaVencimientoAfiliacion: toDateStr(today) },
      'fechaVencimientoAfiliacion',
    )
    expect(msgs.length).toBeGreaterThan(0)
  })

  it('acepta fecha futura', () => {
    const result = patientSchema.safeParse({
      ...validData,
      fechaVencimientoAfiliacion: toDateStr(tomorrow),
    })
    expect(result.success).toBe(true)
  })
})

// ─── Obra Social — validaciones cruzadas ─────────────────────────────────────

describe('obra social — nroAfiliado obligatorio cuando hay OS', () => {
  it('rechaza nroAfiliado vacío si se seleccionó una obra social existente', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: '' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('acepta nroAfiliado vacío si no hay obra social', () => {
    const result = patientSchema.safeParse({ ...validData, idObraSocial: '', nroAfiliado: '' })
    expect(result.success).toBe(true)
  })

  it('rechaza nombreObraSocial vacío si la OS es nueva', () => {
    const data = { ...validData, idObraSocial: 'nueva', nombreObraSocial: '', nroAfiliado: 'ABC123' }
    expect(errorPaths(data)).toContain('nombreObraSocial')
  })

  it('rechaza nombreObraSocial con números', () => {
    const data = { ...validData, idObraSocial: 'nueva', nombreObraSocial: 'OSDE123', nroAfiliado: 'ABC123' }
    const msgs = errorMessages(data, 'nombreObraSocial')
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]).toContain('letras')
  })

  it('acepta OS nueva con nombre y nroAfiliado válidos', () => {
    const result = patientSchema.safeParse({
      ...validData,
      idObraSocial: 'nueva',
      nombreObraSocial: 'OSDE',
      nroAfiliado: 'ABC123',
    })
    expect(result.success).toBe(true)
  })
})

// ─── Nro. de Afiliado — formato ───────────────────────────────────────────────

describe('nroAfiliado — formato', () => {
  it('rechaza nroAfiliado con espacios', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: 'ABC 123' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('rechaza nroAfiliado con 5+ caracteres repetidos', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: 'AAAAA1' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('acepta nroAfiliado alfanumérico válido', () => {
    const result = patientSchema.safeParse({
      ...validData,
      idObraSocial: '2',
      nroAfiliado: 'OS12345',
    })
    expect(result.success).toBe(true)
  })
})
