-- ============================================================
-- SEED DATA - Sistema de Gestión Médica
-- Compatible con: schema.sql (GENERATED ALWAYS AS IDENTITY)
-- Orden de inserción respeta dependencias de FK
-- ============================================================

-- Desactivar RLS temporalmente para insertar datos de prueba
-- (Ejecutar como superusuario o con rol bypassrls)

SET session_replication_role = replica;

-- ============================================================
-- 1. PROVINCIAS
-- ============================================================
INSERT INTO provincia (nombre_provincia) VALUES
  ('Chaco'), ('Buenos Aires'), ('Córdoba'), ('Santa Fe'), ('Mendoza');

-- ============================================================
-- 2. LOCALIDADES
-- ============================================================
INSERT INTO localidad (nombre_localidad, codigo_postal, id_provincia) VALUES
  ('Resistencia', 3500, 1), ('La Plata', 1900, 2), ('Córdoba Capital', 5000, 3),
  ('Rosario', 2000, 4), ('Mendoza Capital', 5500, 5);

-- ============================================================
-- 3. ROLES
-- ============================================================
INSERT INTO rol (nombre_rol) VALUES ('ADMIN'), ('MEDICO'), ('ENFERMERO');

-- ============================================================
-- 4. OBRAS SOCIALES
-- ============================================================
INSERT INTO obra_social (nombre_obra) VALUES ('OSDE'), ('Swiss Medical'), ('PAMI');

-- ============================================================
-- 5. MAESTROS MÉDICOS (Alergias, Enfermedades y Antecedentes)
-- ============================================================
INSERT INTO alergia (nombre_alergia) VALUES ('Penicilina'), ('Polen'), ('Látex');

INSERT INTO enfermedad_cronica (nombre_enfermedad) VALUES 
  ('Hipertensión arterial'), ('Asma leve'), ('Diabetes tipo 2'), ('EPOC');

INSERT INTO antecedente_familiar (nombre_enfermedad) VALUES 
  ('Diabetes tipo 2'), ('Hipertensión'), ('Cardiopatía'), ('Cáncer de colon');

-- ============================================================
-- 6. PERSONAS
-- ============================================================
INSERT INTO persona (nombre_persona, apellido_persona, fecha_nacimiento, fecha_fallecimiento) VALUES
  ('María', 'González', '1985-03-12', NULL), -- id 1
  ('Carlos', 'Rodríguez', '1990-07-24', NULL), -- id 2
  ('Ana', 'Martínez', '1975-11-05', NULL),    -- id 3
  ('Luis', 'Fernández', '2000-01-18', NULL),   -- id 4
  ('Sofía', 'López', '1968-09-30', NULL),       -- id 5
  ('Roberto', 'Admin', '1980-06-15', NULL),    -- id 6
  ('Claudia', 'Medina', '1982-04-20', NULL);   -- id 7

-- ============================================================
-- 7. DOMICILIOS
-- ============================================================
INSERT INTO domicilio (calle, numero, piso, id_localidad) VALUES
  ('Av. Lavalle', 123, NULL, 1), ('Calle San Martín', 456, 2, 1),
  ('Belgrano', 789, NULL, 2), ('Mitre', 1010, 3, 3), ('Rivadavia', 321, NULL, 4);

-- ============================================================
-- 8. RESIDENCIAS
-- ============================================================
INSERT INTO residencia (tipo_residencia, id_direccion) VALUES
  ('permanente', 1), ('permanente', 2), ('transitorio', 3), ('permanente', 4), ('permanente', 5);

-- ============================================================
-- 9. FICHAS MÉDICAS (Estructura simplificada según DER)
-- ============================================================
INSERT INTO ficha_medica (tipo_sangre, antecedentes_familiares_text) VALUES
  ('A+', 'Madre con diabetes'), ('O+', NULL), ('B+', 'Abuelo con cardiopatía'),
  ('AB-', NULL), ('O-', 'Madre con cáncer de colon');

-- ============================================================
-- 10. AFILIACIONES (Nueva tabla de nexo según DER)
-- ============================================================
INSERT INTO afiliacion_obra_social (numero_afiliado, id_obra_social) VALUES
  ('OSDE-00123', 1), -- id 1 (María)
  ('SWM-00456', 2),  -- id 2 (Carlos)
  ('PAMI-00789', 3), -- id 3 (Ana)
  ('PAMI-01012', 3); -- id 4 (Sofía)

-- ============================================================
-- 11. PACIENTES (Incluye FK a Afiliación)
-- ============================================================
INSERT INTO paciente (dni, id_persona, id_residencia, id_ficha_medica, id_afiliacion) VALUES
  (32456789, 1, 1, 1, 1),    -- María
  (38123456, 2, 2, 2, 2),    -- Carlos
  (25987654, 3, 3, 3, 3),    -- Ana
  (42345678, 4, 4, 4, NULL), -- Luis (Sin obra social)
  (20654321, 5, 5, 5, 4);    -- Sofía

-- ============================================================
-- 12. ANTECEDENTES MÉDICOS (Relación muchos a muchos)
-- ============================================================
INSERT INTO antecedente_medico (id_ficha_medica, id_alergia, id_enfermedad_cronica, id_antecedente_familiar) VALUES
  (1, 1, 1, 1), -- Ficha 1: Penicilina, Hipertensión, Antecedente Diabetes
  (2, 1, 2, 2), -- Ficha 2: Penicilina, Asma, Antecedente Hipertensión
  (3, 3, 3, 3), -- Ficha 3: Látex, Diabetes, Antecedente Cardiopatía
  (5, 2, 4, 4); -- Ficha 5: Polen, EPOC, Antecedente Cáncer

-- ============================================================
-- 13. TELÉFONOS
-- ============================================================
INSERT INTO telefono (numero_telefono, tipo_telefono, id_paciente) VALUES
  ('+54 362 4123456', 'personal', 1), ('+54 362 4234567', 'personal', 2);

-- ============================================================
-- 14. CONTACTOS DE EMERGENCIA
-- ============================================================
INSERT INTO contacto_emergencia (id_paciente, nombre_completo, parentesco, telefono_celular) VALUES
  (1, 'Jorge González', 'Esposo', '+54 362 4111222'), (2, 'Laura Rodríguez', 'Madre', '+54 362 4333444');

-- ============================================================
-- 15. USUARIOS (Con campo 'autorizacion' del DER)
-- ============================================================
INSERT INTO usuario (email, pass, id_rol, id_persona, autorizacion) VALUES
  ('admin@hospital.com', '$2b$12$LQv3c...', 1, 6, 'FULL_ACCESS'),
  ('claudia.medina@hospital.com', '$2b$12$92IX...', 2, 7, 'READ_WRITE');

-- ============================================================
-- 16. HABITACIONES
-- ============================================================
INSERT INTO habitacion_internacion (numero_habitacion, piso_habitacion, estado_habitacion) VALUES
  ('101A', 1, 'disponible'), ('102A', 1, 'ocupada'), ('201B', 2, 'mantenimiento');

-- ============================================================
-- 17. TIPO DE PROCEDIMIENTOS
-- ============================================================
INSERT INTO tipo_procedimiento (nombre_tipo_procedimiento) VALUES
  ('Consulta clínica'), ('Extracción de sangre'), ('Internación');

-- ============================================================
-- 18. HISTORIALES E INTERNACIONES
-- ============================================================
INSERT INTO historial_medico (observaciones, estado_historial, id_paciente) VALUES
  ('Seguimiento crónico', 'activo', 1), ('Control preventivo', 'activo', 2);

INSERT INTO internacion (fecha_inicio, id_historial, id_habitacion_internacion) VALUES
  ('2026-04-10 08:00:00', 1, 2);

-- ============================================================
-- 19. REGISTROS CLÍNICOS
-- ============================================================
INSERT INTO registro_clinico (descripcion, id_historial, id_tipo_procedimiento, id_usuario) VALUES
  ('Control rutinario de presión', 1, 1, 2);

SET session_replication_role = DEFAULT;

-- ============================================================
-- VERIFICACIÓN RÁPIDA (comentar si no es necesario)
-- ============================================================

/*
SELECT 'provincias'    AS tabla, COUNT(*) AS total FROM provincia
UNION ALL
SELECT 'localidades',           COUNT(*) FROM localidad
UNION ALL
SELECT 'roles',                 COUNT(*) FROM rol
UNION ALL
SELECT 'obras_sociales',        COUNT(*) FROM obra_social
UNION ALL
SELECT 'alergias',              COUNT(*) FROM alergia
UNION ALL
SELECT 'personas',              COUNT(*) FROM persona
UNION ALL
SELECT 'domicilios',            COUNT(*) FROM domicilio
UNION ALL
SELECT 'residencias',           COUNT(*) FROM residencia
UNION ALL
SELECT 'fichas_medicas',        COUNT(*) FROM ficha_medica
UNION ALL
SELECT 'pacientes',             COUNT(*) FROM paciente
UNION ALL
SELECT 'telefonos',             COUNT(*) FROM telefono
UNION ALL
SELECT 'contactos_emergencia',  COUNT(*) FROM contacto_emergencia
UNION ALL
SELECT 'paciente_alergia',      COUNT(*) FROM paciente_alergia
UNION ALL
SELECT 'usuarios',              COUNT(*) FROM usuario
UNION ALL
SELECT 'habitaciones',          COUNT(*) FROM habitacion_internacion
UNION ALL
SELECT 'tipo_procedimientos',   COUNT(*) FROM tipo_procedimiento
UNION ALL
SELECT 'historiales',           COUNT(*) FROM historial_medico
UNION ALL
SELECT 'internaciones',         COUNT(*) FROM internacion
UNION ALL
SELECT 'registros_clinicos',    COUNT(*) FROM registro_clinico;
*/