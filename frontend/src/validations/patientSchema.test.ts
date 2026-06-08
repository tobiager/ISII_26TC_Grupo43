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

  it('acepta fecha de hoy (neonatos)', () => {
    const result = patientSchema.safeParse({ ...validData, fechaNacimiento: toDateStr(today) })
    expect(result.success).toBe(true)
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

  it('rechaza valor mayor a 99999', () => {
    expect(errorPaths({ ...validData, numeroDireccion: 100000 })).toContain('numeroDireccion')
  })

  it('acepta valor positivo', () => {
    const result = patientSchema.safeParse({ ...validData, numeroDireccion: 1 })
    expect(result.success).toBe(true)
  })

  it('acepta valor límite 99999', () => {
    const result = patientSchema.safeParse({ ...validData, numeroDireccion: 99999 })
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

  it('rechaza piso mayor a 999', () => {
    const msgs = errorMessages({ ...validData, piso: 1000 }, 'piso')
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]).toContain('999')
  })

  it('acepta piso positivo', () => {
    const result = patientSchema.safeParse({ ...validData, piso: 3 })
    expect(result.success).toBe(true)
  })

  it('acepta piso límite 999', () => {
    const result = patientSchema.safeParse({ ...validData, piso: 999 })
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
    const data = { ...validData, idObraSocial: 'nueva', nombreObraSocial: '', nroAfiliado: '123456' }
    expect(errorPaths(data)).toContain('nombreObraSocial')
  })

  it('rechaza nombreObraSocial con números', () => {
    const data = { ...validData, idObraSocial: 'nueva', nombreObraSocial: 'OSDE123', nroAfiliado: '123456' }
    const msgs = errorMessages(data, 'nombreObraSocial')
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]).toContain('letras')
  })

  it('acepta OS nueva con nombre y nroAfiliado válidos', () => {
    const result = patientSchema.safeParse({
      ...validData,
      idObraSocial: 'nueva',
      nombreObraSocial: 'OSDE',
      nroAfiliado: '123456',
    })
    expect(result.success).toBe(true)
  })
})

// ─── Tipo de sangre ───────────────────────────────────────────────────────────

describe('tipoSangre', () => {
  it('rechaza valor vacío', () => {
    expect(errorPaths({ ...validData, tipoSangre: '' })).toContain('tipoSangre')
  })

  it('rechaza valor no permitido (XY)', () => {
    expect(errorPaths({ ...validData, tipoSangre: 'XY' })).toContain('tipoSangre')
  })

  it('rechaza valor no permitido (C+)', () => {
    expect(errorPaths({ ...validData, tipoSangre: 'C+' })).toContain('tipoSangre')
  })

  it('acepta A+', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'A+' }).success).toBe(true)
  })

  it('acepta A-', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'A-' }).success).toBe(true)
  })

  it('acepta B+', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'B+' }).success).toBe(true)
  })

  it('acepta B-', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'B-' }).success).toBe(true)
  })

  it('acepta AB+', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'AB+' }).success).toBe(true)
  })

  it('acepta AB-', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'AB-' }).success).toBe(true)
  })

  it('acepta O+', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'O+' }).success).toBe(true)
  })

  it('acepta O-', () => {
    expect(patientSchema.safeParse({ ...validData, tipoSangre: 'O-' }).success).toBe(true)
  })
})

// ─── Teléfono ─────────────────────────────────────────────────────────────────

describe('telefono', () => {
  it('acepta campo vacío (opcional)', () => {
    expect(patientSchema.safeParse({ ...validData, telefono: '' }).success).toBe(true)
  })

  it('acepta formato local de 10 dígitos (1123456789)', () => {
    expect(patientSchema.safeParse({ ...validData, telefono: '1123456789' }).success).toBe(true)
  })

  it('acepta formato con código de país 54 (541123456789)', () => {
    expect(patientSchema.safeParse({ ...validData, telefono: '541123456789' }).success).toBe(true)
  })

  it('acepta formato con código de país 549 (5491123456789)', () => {
    expect(patientSchema.safeParse({ ...validData, telefono: '5491123456789' }).success).toBe(true)
  })

  it('rechaza teléfono con letras', () => {
    expect(errorPaths({ ...validData, telefono: 'abc123' })).toContain('telefono')
  })

  it('rechaza teléfono con longitud inválida (solo 6 dígitos)', () => {
    expect(errorPaths({ ...validData, telefono: '123456' })).toContain('telefono')
  })

  it('rechaza teléfono con más de 13 caracteres', () => {
    expect(errorPaths({ ...validData, telefono: '54912345678901' })).toContain('telefono')
  })
})

// ─── Tipo de teléfono ─────────────────────────────────────────────────────────

describe('tipoTelefono', () => {
  it('acepta personal', () => {
    expect(patientSchema.safeParse({ ...validData, tipoTelefono: 'personal' }).success).toBe(true)
  })

  it('acepta emergencia', () => {
    expect(patientSchema.safeParse({ ...validData, tipoTelefono: 'emergencia' }).success).toBe(true)
  })

  it('rechaza laboral', () => {
    expect(errorPaths({ ...validData, tipoTelefono: 'laboral' })).toContain('tipoTelefono')
  })

  it('rechaza hogar', () => {
    expect(errorPaths({ ...validData, tipoTelefono: 'hogar' })).toContain('tipoTelefono')
  })
})

// ─── Tipo de residencia ───────────────────────────────────────────────────────

describe('tipoResidencia', () => {
  it('acepta permanente', () => {
    expect(patientSchema.safeParse({ ...validData, tipoResidencia: 'permanente' }).success).toBe(true)
  })

  it('acepta transitorio', () => {
    expect(patientSchema.safeParse({ ...validData, tipoResidencia: 'transitorio' }).success).toBe(true)
  })

  it('rechaza fijo', () => {
    expect(errorPaths({ ...validData, tipoResidencia: 'fijo' })).toContain('tipoResidencia')
  })

  it('rechaza temporal', () => {
    expect(errorPaths({ ...validData, tipoResidencia: 'temporal' })).toContain('tipoResidencia')
  })
})

// ─── Nro. de Afiliado — formato ───────────────────────────────────────────────

describe('nroAfiliado — formato', () => {
  it('rechaza nroAfiliado con espacios', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: '123 456' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('rechaza nroAfiliado con letras', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: 'ABC123' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('rechaza nroAfiliado con 5+ dígitos repetidos', () => {
    const data = { ...validData, idObraSocial: '2', nroAfiliado: '111111' }
    expect(errorPaths(data)).toContain('nroAfiliado')
  })

  it('acepta nroAfiliado numérico válido', () => {
    const result = patientSchema.safeParse({
      ...validData,
      idObraSocial: '2',
      nroAfiliado: '12345678',
    })
    expect(result.success).toBe(true)
  })
})
