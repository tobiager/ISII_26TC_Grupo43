import { z } from 'zod'

// ─── Helpers de validación exportados ────────────────────────────────────────

/** Solo letras (incluyendo tildes y ñ), espacios, guiones y apóstrofes */
export const SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s''`-]+$/

/** Teléfono: dígitos, espacios, guiones, paréntesis, +, punto */
export const TELEFONO_REGEX = /^[\d\s\-()+.]+$/

// ─── Coerciones para campos numéricos opcionales ─────────────────────────────

/**
 * Convierte '' / null / undefined → undefined antes de validar.
 * Úsalo en campos numéricos opcionales (piso, idProvincia).
 */
const optionalInt = z.preprocess(
  (v) => (v === '' || v == null) ? undefined : Number(v),
  z.number().int().min(0).optional(),
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
        (d) => !!d && new Date(d) < new Date(),
        'La fecha no puede ser igual o posterior a hoy',
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
      ),

    tipoTelefono: z.enum(
      ['personal', 'emergencia'] as const,
      { error: 'Seleccioná un tipo de teléfono válido' },
    ),

    // ── Dirección (campos obligatorios) ───────────────────────────────────────
    direccion: z
      .string()
      .min(1, 'La calle es obligatoria')
      .max(200, 'Máximo 200 caracteres'),

    /**
     * '' → 0 → falla min(1) → "El número de domicilio es obligatorio"
     */
    numeroDireccion: z.coerce
      .number()
      .int('El número de domicilio debe ser un entero')
      .min(1, 'El número de domicilio es obligatorio'),

    /** Piso opcional: '' → undefined */
    piso: optionalInt,

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

    nroAfiliado: z.string().max(50, 'Máximo 50 caracteres').default(''),

    fechaVencimientoAfiliacion: z.string().default(''),

    // ── Ficha médica ──────────────────────────────────────────────────────────
    antecedentesText: z.string().max(2000, 'Máximo 2000 caracteres').default(''),
  })

  // ── Validaciones cruzadas (obra social) ────────────────────────────────────
  .superRefine((data, ctx) => {
    const tieneOSExistente =
      data.idObraSocial !== '' && data.idObraSocial !== 'nueva'

    if (tieneOSExistente && !data.nroAfiliado.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de afiliado es obligatorio al seleccionar una obra social',
        path: ['nroAfiliado'],
      })
    }

    if (data.idObraSocial === 'nueva' && !data.nombreObraSocial.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ingresá el nombre de la obra social',
        path: ['nombreObraSocial'],
      })
    }
  })

export type PatientFormValues = z.infer<typeof patientSchema>
