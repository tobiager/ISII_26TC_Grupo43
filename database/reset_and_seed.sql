-- ============================================================
-- SCRIPT DE RESET Y RECARGA COMPLETA DE DATOS
-- Limpia todas las tablas (TRUNCATE + RESTART IDENTITY) y
-- reinsertar todos los datos del seed en un único script.
--
-- USO OPCIÓN A – psql CLI (local o Supabase):
--   psql "postgresql://<user>:<pass>@<host>/<db>" \
--        -f database/reset_and_seed.sql
--
-- USO OPCIÓN B – Supabase SQL Editor (web):
--   1. Abrir el SQL Editor en el dashboard de Supabase.
--   2. Crear una nueva query.
--   3. Pegar TODO el contenido de este archivo.
--   4. Ejecutar (Run).
-- ============================================================

-- ============================================================
-- FASE 1: TRUNCATE (vaciar tablas en orden correcto + resetear secuencias)
-- ============================================================
SET session_replication_role = replica;

TRUNCATE TABLE
  registro_clinico,
  internacion,
  historial_medico,
  habitacion_internacion,
  tipo_procedimiento,
  telefono,
  contacto_emergencia,
  usuario,
  paciente,
  ficha_antecedente_familiar,
  ficha_enfermedad_cronica,
  ficha_alergia,
  ficha_medica,
  afiliacion_obra_social,
  residencia,
  domicilio,
  antecedente_familiar,
  enfermedad_cronica,
  alergia,
  localidad,
  obra_social,
  rol,
  persona,
  provincia
RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;

-- ============================================================
-- FASE 2: SEED DATA (datos consistentes con el esquema N:M)
-- ============================================================

SET session_replication_role = replica;

-- ── 1. PROVINCIAS ─────────────────────────────────────────────
INSERT INTO provincia (nombre_provincia) VALUES
  ('Buenos Aires'), ('Ciudad Autónoma de Buenos Aires'), ('Catamarca'), ('Chaco'),
  ('Chubut'), ('Córdoba'), ('Corrientes'), ('Entre Ríos'), ('Formosa'), ('Jujuy'),
  ('La Pampa'), ('La Rioja'), ('Mendoza'), ('Misiones'), ('Neuquén'), ('Río Negro'),
  ('Salta'), ('San Juan'), ('San Luis'), ('Santa Cruz'), ('Santa Fe'),
  ('Santiago del Estero'), ('Tierra del Fuego'), ('Tucumán');

-- ── 2. LOCALIDADES ────────────────────────────────────────────
INSERT INTO localidad (nombre_localidad, codigo_postal, id_provincia) VALUES
  ('La Plata', 1900, 1), ('Mar del Plata', 7600, 1), ('Bahía Blanca', 8000, 1), ('Lanús', 1824, 1), ('Tandil', 7000, 1),
  ('Palermo', 1425, 2), ('Caballito', 1405, 2), ('Flores', 1406, 2), ('Belgrano', 1428, 2), ('Recoleta', 1112, 2),
  ('San Fernando del Valle', 4700, 3), ('Andalgalá', 4740, 3), ('Belén', 4750, 3), ('Tinogasta', 5340, 3), ('Recreo', 5260, 3),
  ('Resistencia', 3500, 4), ('Presidencia Roque Sáenz Peña', 3700, 4), ('Villa Ángela', 3540, 4), ('Charata', 3730, 4), ('Fontana', 3503, 4),
  ('Rawson', 9103, 5), ('Comodoro Rivadavia', 9000, 5), ('Puerto Madryn', 9120, 5), ('Esquel', 9200, 5), ('Trelew', 9100, 5),
  ('Córdoba Capital', 5000, 6), ('Villa Carlos Paz', 5152, 6), ('Río Cuarto', 5800, 6), ('San Francisco', 2400, 6), ('Alta Gracia', 5186, 6),
  ('Corrientes Capital', 3400, 7), ('Goya', 3450, 7), ('Paso de los Libres', 3230, 7), ('Curuzú Cuatiá', 3460, 7), ('Mercedes', 3470, 7),
  ('Paraná', 3100, 8), ('Concordia', 3200, 8), ('Gualeguaychú', 2820, 8), ('Villaguay', 3240, 8), ('Victoria', 3153, 8),
  ('Formosa Capital', 3600, 9), ('Clorinda', 3610, 9), ('Pirané', 3606, 9), ('El Colorado', 3601, 9), ('Las Lomitas', 3630, 9),
  ('San Salvador de Jujuy', 4600, 10), ('Palpalá', 4612, 10), ('Perico', 4608, 10), ('San Pedro', 4500, 10), ('Humahuaca', 4630, 10),
  ('Santa Rosa', 6300, 11), ('General Pico', 6360, 11), ('Realicó', 6200, 11), ('Eduardo Castex', 6380, 11), ('25 de Mayo', 8201, 11),
  ('La Rioja Capital', 5300, 12), ('Chilecito', 5360, 12), ('Aimogasta', 5310, 12), ('Chamical', 5380, 12), ('Chepes', 5470, 12),
  ('Mendoza Capital', 5500, 13), ('San Rafael', 5600, 13), ('Godoy Cruz', 5501, 13), ('Luján de Cuyo', 5507, 13), ('Maipú', 5515, 13),
  ('Posadas', 3300, 14), ('Puerto Iguazú', 3370, 14), ('Oberá', 3360, 14), ('Eldorado', 3380, 14), ('Apóstoles', 3350, 14),
  ('Neuquén Capital', 8300, 15), ('San Martín de los Andes', 8370, 15), ('Zapala', 8340, 15), ('Plottier', 8316, 15), ('Centenario', 8309, 15),
  ('Viedma', 8500, 16), ('San Carlos de Bariloche', 8400, 16), ('General Roca', 8332, 16), ('Cipolletti', 8324, 16), ('Las Grutas', 8521, 16),
  ('Salta Capital', 4400, 17), ('San Ramón de la Nueva Orán', 4530, 17), ('Tartagal', 4560, 17), ('Cafayate', 4427, 17), ('Metán', 4440, 17),
  ('San Juan Capital', 5400, 18), ('Rawson (San Juan)', 5425, 18), ('Rivadavia', 5401, 18), ('Chimbas', 5413, 18), ('Santa Lucía', 5411, 18),
  ('San Luis Capital', 5700, 19), ('Villa Mercedes', 5730, 19), ('Merlo', 5881, 19), ('La Punta', 5710, 19), ('Juana Koslay', 5701, 19),
  ('Río Gallegos', 9400, 20), ('El Calafate', 9405, 20), ('Caleta Olivia', 9011, 20), ('Puerto Deseado', 9050, 20), ('Perito Moreno', 9040, 20),
  ('Santa Fe Capital', 3000, 21), ('Rosario', 2000, 21), ('Venado Tuerto', 2600, 21), ('Rafaela', 2300, 21), ('Reconquista', 3560, 21),
  ('Santiago del Estero Capital', 4200, 22), ('La Banda', 4300, 22), ('Termas de Río Hondo', 4220, 22), ('Frías', 4230, 22), ('Añatuya', 4320, 22),
  ('Ushuaia', 9410, 23), ('Río Grande', 9420, 23), ('Tolhuin', 9412, 23), ('Puerto Almanza', 9411, 23), ('Lago Escondido', 9413, 23),
  ('San Miguel de Tucumán', 4000, 24), ('Yerba Buena', 4107, 24), ('Tafí del Valle', 4137, 24), ('Concepción', 4146, 24), ('Lules', 4128, 24);

-- ── 3. ROLES Y OBRAS SOCIALES ─────────────────────────────────
-- Roles: 1=ADMIN, 2=MEDICO, 3=ENFERMERO
INSERT INTO rol (nombre_rol) VALUES ('ADMIN'), ('MEDICO'), ('ENFERMERO');
-- Obras: 1=OSDE, 2=Swiss Medical, 3=PAMI, 4=IOMA, 5=Galeno
INSERT INTO obra_social (nombre_obra) VALUES ('OSDE'), ('Swiss Medical'), ('PAMI'), ('IOMA'), ('Galeno');

-- ── 4. TABLAS MAESTRAS MÉDICAS ────────────────────────────────
-- Alergias: 1=Penicilina, 2=Polen, 3=Látex, 4=Aspirina, 5=Frutos Secos
INSERT INTO alergia (nombre_alergia) VALUES ('Penicilina'), ('Polen'), ('Látex'), ('Aspirina'), ('Frutos Secos');
-- Enf. crónicas: 1=HTA, 2=Asma, 3=Diabetes, 4=EPOC, 5=Hipotiroidismo
INSERT INTO enfermedad_cronica (nombre_enfermedad) VALUES ('Hipertensión arterial'), ('Asma leve'), ('Diabetes tipo 2'), ('EPOC'), ('Hipotiroidismo');
-- Antecedentes: 1=Diabetes, 2=Hipertensión, 3=Cardiopatía, 4=Cáncer colon, 5=Alzheimer
INSERT INTO antecedente_familiar (nombre_enfermedad) VALUES ('Diabetes tipo 2'), ('Hipertensión'), ('Cardiopatía'), ('Cáncer de colon'), ('Alzheimer');

-- ── 5. PERSONAS ───────────────────────────────────────────────
-- IDs: 1..10 = pacientes | 11 = médico (Claudia) | 12 = admin (Roberto)
INSERT INTO persona (nombre_persona, apellido_persona, fecha_nacimiento) VALUES
  ('Juan',     'Pérez',    '1980-01-01'),
  ('María',    'García',   '1992-05-15'),
  ('Ricardo',  'Darín',    '1957-01-16'),
  ('Antonela', 'Roccuzzo', '1988-02-26'),
  ('Lionel',   'Messi',    '1987-06-24'),
  ('Tini',     'Stoessel', '1997-03-21'),
  ('Bizarrap', 'Gonzalo',  '1998-08-29'),
  ('Lali',     'Espósito', '1991-10-10'),
  ('Duki',     'Mauro',    '1996-06-24'),
  ('Nicki',    'Nicole',   '2000-08-25'),
  ('Claudia',  'Medina',   '1982-04-20'),
  ('Roberto',  'Admin',    '1980-06-15');

-- ── 6. DOMICILIOS ─────────────────────────────────────────────
-- Localidades elegidas: 1 (La Plata), 6 (Palermo), 76 (Viedma),
--   26 (Córdoba Cap), 31 (Corrientes Cap), 51 (Santa Rosa),
--   61 (Mendoza Cap), 96 (Río Gallegos), 46 (Salta Cap), 101 (SFe Cap)
-- IDs resultantes: 1..10
INSERT INTO domicilio (calle, numero, id_localidad) VALUES
  ('Av. 7',         1234,   1),
  ('Florida',         50,   6),
  ('Av. Sarmiento', 2500,  76),
  ('9 de Julio',     900,  26),
  ('Belgrano',       400,  31),
  ('San Martín',     101,  51),
  ('Av. Colón',       88,  61),
  ('Las Heras',      450,  96),
  ('Rivadavia',       33,  46),
  ('O''Higgins',     500, 101);

-- ── 7. RESIDENCIAS ────────────────────────────────────────────
-- IDs: 1..10 (SELECT ORDER BY garantiza correspondencia 1-a-1 con domicilios)
INSERT INTO residencia (tipo_residencia, id_direccion)
SELECT 'permanente', id_direccion FROM domicilio ORDER BY id_direccion;

-- ── 8. FICHAS MÉDICAS ─────────────────────────────────────────
-- IDs: 1..10
INSERT INTO ficha_medica (tipo_sangre, antecedentes_familiares_text) VALUES
  ('A+', 'Padre con HTA'),
  ('O+', NULL),
  ('B-', 'Madre diabética'),
  ('AB+', NULL),
  ('O-', NULL),
  ('A-', 'Abuelo con cáncer'),
  ('O+', NULL),
  ('B+', NULL),
  ('A+', 'Hermano asmático'),
  ('O+', NULL);

-- ── 9. AFILIACIONES ───────────────────────────────────────────
-- IDs: 1..10
INSERT INTO afiliacion_obra_social (numero_afiliado, id_obra_social) VALUES
  ('10001', 1), ('20002', 2), ('30003', 3), ('40004', 4), ('50005', 5),
  ('60006', 1), ('70007', 2), ('80008', 3), ('90009', 4), ('10101', 5);

-- ── 10. PACIENTES ─────────────────────────────────────────────
-- persona i → residencia i → ficha i → afiliacion i  (i = 1..10)
INSERT INTO paciente (dni, id_persona, id_residencia, id_ficha_medica, id_afiliacion) VALUES
  (30000001,  1,  1,  1,  1),
  (30000002,  2,  2,  2,  2),
  (30000003,  3,  3,  3,  3),
  (30000004,  4,  4,  4,  4),
  (30000005,  5,  5,  5,  5),
  (30000006,  6,  6,  6,  6),
  (30000007,  7,  7,  7,  7),
  (30000008,  8,  8,  8,  8),
  (30000009,  9,  9,  9,  9),
  (30000010, 10, 10, 10, 10);

-- ── 11. NEXO N:M ──────────────────────────────────────────────
INSERT INTO ficha_alergia (id_ficha_medica, id_alergia) VALUES
  (1, 1), -- Juan → Penicilina
  (2, 2), -- María → Polen
  (3, 3), -- Ricardo → Látex
  (5, 5), -- Lionel → Frutos Secos
  (8, 4); -- Lali → Aspirina

INSERT INTO ficha_enfermedad_cronica (id_ficha_medica, id_enfermedad_cronica) VALUES
  (1, 1), -- Juan → Hipertensión arterial
  (3, 3), -- Ricardo → Diabetes tipo 2
  (5, 4), -- Lionel → EPOC
  (9, 2); -- Duki → Asma leve

INSERT INTO ficha_antecedente_familiar (id_ficha_medica, id_antecedente_familiar) VALUES
  (1, 2), -- Juan → Hipertensión familiar
  (3, 1), -- Ricardo → Diabetes familiar
  (6, 4), -- Tini → Cáncer de colon familiar
  (9, 3); -- Duki → Cardiopatía familiar

-- ── 12. USUARIOS ──────────────────────────────────────────────
-- admin@hospital.com  → id_persona=12 (Roberto Admin),  rol=1 (ADMIN)
-- claudia@hospital.com → id_persona=11 (Claudia Medina), rol=2 (MEDICO)
-- Hash BCrypt de "admin123" generado con cost=10
-- NOTA: Sin Spring Security activo, 'pass' es texto plano comparado desde el frontend.
-- Reemplazar por hashes BCrypt al implementar Spring Security.
INSERT INTO usuario (email, pass, id_rol, id_persona, autorizacion) VALUES
  ('admin@hospital.com',   'hash_admin',  1, 12, 'FULL_ACCESS'),
  ('claudia@hospital.com', 'hash_medico', 2, 11, 'READ_WRITE');

-- ── 13. OTROS DATOS ───────────────────────────────────────────
INSERT INTO habitacion_internacion (numero_habitacion, piso_habitacion, estado_habitacion) VALUES
  ('101', 1, 'disponible'), ('102', 1, 'disponible'), ('201', 2, 'disponible');

INSERT INTO tipo_procedimiento (nombre_tipo_procedimiento) VALUES
  ('Consulta clínica'), ('Extracción de sangre'), ('Radiografía');

SET session_replication_role = DEFAULT;

-- ── VERIFICACIÓN ──────────────────────────────────────────────
SELECT 'provincias'              AS tabla, COUNT(*) AS total FROM provincia            UNION ALL
SELECT 'localidades',                      COUNT(*) FROM localidad                    UNION ALL
SELECT 'roles',                            COUNT(*) FROM rol                          UNION ALL
SELECT 'obras_sociales',                   COUNT(*) FROM obra_social                  UNION ALL
SELECT 'alergias',                         COUNT(*) FROM alergia                      UNION ALL
SELECT 'enfermedades_cronicas',            COUNT(*) FROM enfermedad_cronica           UNION ALL
SELECT 'antecedentes_familiares',          COUNT(*) FROM antecedente_familiar         UNION ALL
SELECT 'personas',                         COUNT(*) FROM persona                      UNION ALL
SELECT 'domicilios',                       COUNT(*) FROM domicilio                    UNION ALL
SELECT 'residencias',                      COUNT(*) FROM residencia                   UNION ALL
SELECT 'fichas_medicas',                   COUNT(*) FROM ficha_medica                 UNION ALL
SELECT 'afiliaciones',                     COUNT(*) FROM afiliacion_obra_social       UNION ALL
SELECT 'pacientes',                        COUNT(*) FROM paciente                     UNION ALL
SELECT 'ficha_alergia (N:M)',              COUNT(*) FROM ficha_alergia                UNION ALL
SELECT 'ficha_enf_cronica (N:M)',          COUNT(*) FROM ficha_enfermedad_cronica     UNION ALL
SELECT 'ficha_antec_fam (N:M)',            COUNT(*) FROM ficha_antecedente_familiar   UNION ALL
SELECT 'usuarios',                         COUNT(*) FROM usuario                      UNION ALL
SELECT 'habitaciones',                     COUNT(*) FROM habitacion_internacion        UNION ALL
SELECT 'tipo_procedimientos',              COUNT(*) FROM tipo_procedimiento;
