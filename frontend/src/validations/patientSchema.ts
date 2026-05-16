import { z } from 'zod'

// ─── Normalización de teléfonos ───────────────────────────────────────────────

/** Elimina todo carácter no numérico para comparar o validar teléfonos */
export function normalizarTelefono(tel: string): string {
  return tel.replace(/[^\d]/g, '')
}

/**
 * Valida formato argentino tras normalización:
 * - 10 dígitos: área sin 0 + número sin 15 (ej: 1123456789)
 * - 12 dígitos: 54 + área + número (líneas fijas con código de país)
 * - 13 dígitos: 549 + área + número (móvil con código de país)
 * Retorna true si el campo está vacío (la obligatoriedad se controla por separado).
 */
export function esTelefonoArgentinoValido(tel: string): boolean {
  if (!tel || !tel.trim()) return true
  const d = normalizarTelefono(tel)
  return /^(549\d{10}|54\d{10}|\d{10})$/.test(d)
}

// ─── Regexes exportados ───────────────────────────────────────────────────────

/** Solo letras (con tildes y ñ), espacios, guiones y apóstrofes */
export const SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s''`-]+$/

/** Nombre de obra social: solo letras (con tildes y ñ) y espacios — sin números ni símbolos */
export const NOMBRE_OS_REGEX = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/

/** Teléfono: dígitos, espacios, guiones, paréntesis, + y punto */
export const TELEFONO_REGEX = /^[\d\s\-()+.]+$/

/** Nro. de Afiliado: estrictamente alfanumérico (sin espacios ni símbolos) */
export const NRO_AFILIADO_REGEX = /^[a-zA-Z0-9]+$/

/** Calle: letras (con tildes), números, espacios y puntuación de dirección */
export const CALLE_REGEX = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ0-9\s.,\-#°]+$/

/** Límites de longitud para campos de contactos de emergencia */
export const CONTACT_NOMBRE_MAX = 200
export const CONTACT_PARENTESCO_MAX = 100
export const CONTACT_TELEFONO_MAX = 25

// ─── Helper interno ───────────────────────────────────────────────────────────

/** Retorna true si hay 5 o más caracteres consecutivos iguales */
function tieneRepeticion(s: string): boolean {
  return /(.)\1{4,}/.test(s)
}

// ─── Coerciones para campos numéricos opcionales ─────────────────────────────

/**
 * Piso: opcional, pero si se provee debe ser un entero positivo (>= 1).
 * '' o null → undefined (ausente)
 * 0, -1, etc. → falla min(1)
 */
const pisoOpcional = z.preprocess(
  (v) => (v === '' || v == null) ? undefined : Number(v),
  z.number().int().min(1, 'El piso debe ser un número positivo').optional(),
)

// ─── Esquema de validación del formulario de paciente ────────────────────────

export const patientSchema = z
  .object({

    // ── Datos personales ──────────────────────────────────────────────────────
    nombre: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .max(200, 'Máximo 200 caracteres')
      .regex(SOLO_LETRAS, 'Solo se permiten letras y espacios — sin números ni símbolos'),

    apellido: z
      .string()
      .min(1, 'El apellido es obligatorio')
      .max(200, 'Máximo 200 caracteres')
      .regex(SOLO_LETRAS, 'Solo se permiten letras y espacios — sin números ni símbolos'),

    /**
     * z.coerce.number() convierte la string del input a número.
     *   '' → 0 → falla min(1) → "El DNI es obligatorio"
     *   '123' → 123 → falla min(1_000_000) → "Debe tener 7 u 8 dígitos"
     */
    dni: z.coerce
      .number()
      .int('El DNI debe ser un número entero')
      .min(1, 'El DNI es obligatorio')
      .min(1_000_000, 'El DNI debe tener 7 u 8 dígitos')
      .max(99_999_999, 'El DNI debe tener 7 u 8 dígitos'),

    fechaNacimiento: z
      .string()
      .min(1, 'La fecha de nacimiento es obligatoria')
      .refine(
        (d) => !!d && new Date(d) < new Date(new Date().toISOString().split('T')[0]),
        'La fecha no puede ser igual o posterior a hoy',
      )
      .refine(
        (d) => {
          if (!d) return true;
          const limitDate = new Date();
          limitDate.setFullYear(limitDate.getFullYear() - 150);
          return new Date(d) >= limitDate;
        },
        'La edad debe ser realista (máximo 150 años)',
      ),

    tipoSangre: z.enum(
      ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const,
      { error: 'Seleccioná un tipo de sangre válido' },
    ),

    // ── Teléfono ──────────────────────────────────────────────────────────────
    telefono: z
      .string()
      .max(25, 'Máximo 25 caracteres')
      .refine(
        (v) => v === '' || TELEFONO_REGEX.test(v),
        'Formato inválido — solo números, espacios, guiones o paréntesis',
      )
      .refine(
        (v) => esTelefonoArgentinoValido(v),
        'Ingresá un número argentino válido (ej: 1123456789 ó 5491123456789)',
      ),

    tipoTelefono: z.enum(
      ['personal', 'emergencia'] as const,
      { error: 'Seleccioná un tipo de teléfono válido' },
    ),

    // ── Dirección ─────────────────────────────────────────────────────────────
    direccion: z
      .string()
      .min(1, 'La calle es obligatoria')
      .max(200, 'Máximo 200 caracteres')
      .regex(CALLE_REGEX, 'La calle solo puede contener letras, números y caracteres de dirección comunes'),

    /**
     * '' → 0 → falla min(1) → "El número de domicilio es obligatorio"
     */
    numeroDireccion: z.coerce
      .number()
      .int('El número de domicilio debe ser un entero')
      .min(1, 'El número de domicilio es obligatorio'),

    /** Piso opcional: '' → undefined. Si se ingresa debe ser >= 1. */
    piso: pisoOpcional,

    tipoResidencia: z.enum(
      ['permanente', 'transitorio'] as const,
      { error: 'Seleccioná el tipo de residencia' },
    ),

    /** Provincia solo para el select en cascada — no se envía al backend */
    idProvincia: z.preprocess(
      (v) => (v === '' || v == null) ? undefined : Number(v),
      z.number().positive().optional(),
    ),

    /**
     * Localidad obligatoria.
     * '' → 0 → falla min(1) → "La localidad es obligatoria"
     */
    idLocalidad: z.coerce
      .number()
      .min(1, 'La localidad es obligatoria'),

    // ── Obra Social ───────────────────────────────────────────────────────────
    /**
     * Guardado como string del select: '', ID numérico como string, o 'nueva'.
     * La conversión a número ocurre en handleFormSubmit.
     */
    idObraSocial: z.string().default(''),

    nombreObraSocial: z.string().max(100, 'Máximo 100 caracteres').default(''),

    nroAfiliado: z
      .string()
      .max(20, 'Máximo 20 caracteres')
      .refine(
        (v) => v === '' || NRO_AFILIADO_REGEX.test(v),
        'Solo letras y números — sin espacios ni símbolos',
      )
      .refine(
        (v) => !tieneRepeticion(v),
        'El Nro. de Afiliado no puede contener secuencias de caracteres repetidos',
      )
      .default(''),

    /**
     * La fecha de alta se registra hoy en el backend, por lo que la fecha de
     * vencimiento debe ser estrictamente posterior (mañana como mínimo).
     */
    fechaVencimientoAfiliacion: z
      .string()
      .refine(
        (v) => !v || new Date(v) > new Date(new Date().toISOString().split('T')[0]),
        'La fecha de vencimiento debe ser posterior a la fecha de hoy',
      )
      .default(''),

    // ── Ficha médica ──────────────────────────────────────────────────────────
    antecedentesText: z.string().max(2000, 'Máximo 2000 caracteres').default(''),
  })

  // ── Validaciones cruzadas ─────────────────────────────────────────────────
  .superRefine((data, ctx) => {
    const tieneOS = data.idObraSocial !== ''
    const esNuevaOS = data.idObraSocial === 'nueva'

    // 1. Si hay cualquier obra social (existente o nueva), el Nro. de Afiliado es obligatorio
    if (tieneOS && !data.nroAfiliado.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'El número de afiliado es obligatorio',
        path: ['nroAfiliado'],
      })
    }

    // 2. Si la obra social es "nueva", validar nombre
    if (esNuevaOS) {
      const nombreLimpio = data.nombreObraSocial.trim()
      if (!nombreLimpio) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingresá el nombre de la obra social',
          path: ['nombreObraSocial'],
        })
      } else if (!NOMBRE_OS_REGEX.test(nombreLimpio)) {
        ctx.addIssue({
          code: 'custom',
          message: 'El nombre de la obra social solo puede contener letras y espacios — sin números ni símbolos',
          path: ['nombreObraSocial'],
        })
      }
    }
  })

export type PatientFormValues = z.infer<typeof patientSchema>
