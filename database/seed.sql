-- ============================================================
-- SEED DATA - Sistema de Gestión Médica (ARGENTINA TOTAL)
-- ============================================================

SET session_replication_role = replica;

-- ============================================================
-- 1. PROVINCIAS (Las 24 jurisdicciones de Argentina)
-- IDs resultantes: 1 (Buenos Aires) ... 24 (Tucumán)
-- ============================================================
INSERT INTO provincia (nombre_provincia) VALUES
  ('Buenos Aires'), ('Ciudad Autónoma de Buenos Aires'), ('Catamarca'), ('Chaco'),
  ('Chubut'), ('Córdoba'), ('Corrientes'), ('Entre Ríos'), ('Formosa'), ('Jujuy'),
  ('La Pampa'), ('La Rioja'), ('Mendoza'), ('Misiones'), ('Neuquén'), ('Río Negro'),
  ('Salta'), ('San Juan'), ('San Luis'), ('Santa Cruz'), ('Santa Fe'),
  ('Santiago del Estero'), ('Tierra del Fuego'), ('Tucumán');

-- ============================================================
-- 2. LOCALIDADES (5 por provincia, 120 en total)
-- IDs resultantes:
--   Buenos Aires (prov 1):  1..5
--   CABA         (prov 2):  6..10
--   Catamarca    (prov 3): 11..15
--   Chaco        (prov 4): 16..20
--   Chubut       (prov 5): 21..25
--   Córdoba      (prov 6): 26..30
--   Corrientes   (prov 7): 31..35
--   Entre Ríos   (prov 8): 36..40
--   Formosa      (prov 9): 41..45
--   Jujuy        (prov10): 46..50
--   La Pampa     (prov11): 51..55
--   La Rioja     (prov12): 56..60
--   Mendoza      (prov13): 61..65
--   Misiones     (prov14): 66..70
--   Neuquén      (prov15): 71..75
--   Río Negro    (prov16): 76..80
--   Salta        (prov17): 81..85
--   San Juan     (prov18): 86..90
--   San Luis     (prov19): 91..95
--   Santa Cruz   (prov20): 96..100
--   Santa Fe     (prov21):101..105
--   Stgo Estero  (prov22):106..110
--   T. del Fuego (prov23):111..115
--   Tucumán      (prov24):116..120
-- ============================================================
INSERT INTO localidad (nombre_localidad, codigo_postal, id_provincia) VALUES
  -- Buenos Aires (ID 1) → localidades 1..5
  ('La Plata', 1900, 1), ('Mar del Plata', 7600, 1), ('Bahía Blanca', 8000, 1), ('Lanús', 1824, 1), ('Tandil', 7000, 1),
  -- CABA (ID 2) → localidades 6..10
  ('Palermo', 1425, 2), ('Caballito', 1405, 2), ('Flores', 1406, 2), ('Belgrano', 1428, 2), ('Recoleta', 1112, 2),
  -- Catamarca (ID 3) → localidades 11..15
  ('San Fernando del Valle', 4700, 3), ('Andalgalá', 4740, 3), ('Belén', 4750, 3), ('Tinogasta', 5340, 3), ('Recreo', 5260, 3),
  -- Chaco (ID 4) → localidades 16..20
  ('Resistencia', 3500, 4), ('Presidencia Roque Sáenz Peña', 3700, 4), ('Villa Ángela', 3540, 4), ('Charata', 3730, 4), ('Fontana', 3503, 4),
  -- Chubut (ID 5) → localidades 21..25
  ('Rawson', 9103, 5), ('Comodoro Rivadavia', 9000, 5), ('Puerto Madryn', 9120, 5), ('Esquel', 9200, 5), ('Trelew', 9100, 5),
  -- Córdoba (ID 6) → localidades 26..30
  ('Córdoba Capital', 5000, 6), ('Villa Carlos Paz', 5152, 6), ('Río Cuarto', 5800, 6), ('San Francisco', 2400, 6), ('Alta Gracia', 5186, 6),
  -- Corrientes (ID 7) → localidades 31..35
  ('Corrientes Capital', 3400, 7), ('Goya', 3450, 7), ('Paso de los Libres', 3230, 7), ('Curuzú Cuatiá', 3460, 7), ('Mercedes', 3470, 7),
  -- Entre Ríos (ID 8) → localidades 36..40
  ('Paraná', 3100, 8), ('Concordia', 3200, 8), ('Gualeguaychú', 2820, 8), ('Villaguay', 3240, 8), ('Victoria', 3153, 8),
  -- Formosa (ID 9) → localidades 41..45
  ('Formosa Capital', 3600, 9), ('Clorinda', 3610, 9), ('Pirané', 3606, 9), ('El Colorado', 3601, 9), ('Las Lomitas', 3630, 9),
  -- Jujuy (ID 10) → localidades 46..50
  ('San Salvador de Jujuy', 4600, 10), ('Palpalá', 4612, 10), ('Perico', 4608, 10), ('San Pedro', 4500, 10), ('Humahuaca', 4630, 10),
  -- La Pampa (ID 11) → localidades 51..55
  ('Santa Rosa', 6300, 11), ('General Pico', 6360, 11), ('Realicó', 6200, 11), ('Eduardo Castex', 6380, 11), ('25 de Mayo', 8201, 11),
  -- La Rioja (ID 12) → localidades 56..60
  ('La Rioja Capital', 5300, 12), ('Chilecito', 5360, 12), ('Aimogasta', 5310, 12), ('Chamical', 5380, 12), ('Chepes', 5470, 12),
  -- Mendoza (ID 13) → localidades 61..65
  ('Mendoza Capital', 5500, 13), ('San Rafael', 5600, 13), ('Godoy Cruz', 5501, 13), ('Luján de Cuyo', 5507, 13), ('Maipú', 5515, 13),
  -- Misiones (ID 14) → localidades 66..70
  ('Posadas', 3300, 14), ('Puerto Iguazú', 3370, 14), ('Oberá', 3360, 14), ('Eldorado', 3380, 14), ('Apóstoles', 3350, 14),
  -- Neuquén (ID 15) → localidades 71..75
  ('Neuquén Capital', 8300, 15), ('San Martín de los Andes', 8370, 15), ('Zapala', 8340, 15), ('Plottier', 8316, 15), ('Centenario', 8309, 15),
  -- Río Negro (ID 16) → localidades 76..80
  ('Viedma', 8500, 16), ('San Carlos de Bariloche', 8400, 16), ('General Roca', 8332, 16), ('Cipolletti', 8324, 16), ('Las Grutas', 8521, 16),
  -- Salta (ID 17) → localidades 81..85
  ('Salta Capital', 4400, 17), ('San Ramón de la Nueva Orán', 4530, 17), ('Tartagal', 4560, 17), ('Cafayate', 4427, 17), ('Metán', 4440, 17),
  -- San Juan (ID 18) → localidades 86..90
  ('San Juan Capital', 5400, 18), ('Rawson (San Juan)', 5425, 18), ('Rivadavia', 5401, 18), ('Chimbas', 5413, 18), ('Santa Lucía', 5411, 18),
  -- San Luis (ID 19) → localidades 91..95
  ('San Luis Capital', 5700, 19), ('Villa Mercedes', 5730, 19), ('Merlo', 5881, 19), ('La Punta', 5710, 19), ('Juana Koslay', 5701, 19),
  -- Santa Cruz (ID 20) → localidades 96..100
  ('Río Gallegos', 9400, 20), ('El Calafate', 9405, 20), ('Caleta Olivia', 9011, 20), ('Puerto Deseado', 9050, 20), ('Perito Moreno', 9040, 20),
  -- Santa Fe (ID 21) → localidades 101..105
  ('Santa Fe Capital', 3000, 21), ('Rosario', 2000, 21), ('Venado Tuerto', 2600, 21), ('Rafaela', 2300, 21), ('Reconquista', 3560, 21),
  -- Santiago del Estero (ID 22) → localidades 106..110
  ('Santiago del Estero Capital', 4200, 22), ('La Banda', 4300, 22), ('Termas de Río Hondo', 4220, 22), ('Frías', 4230, 22), ('Añatuya', 4320, 22),
  -- Tierra del Fuego (ID 23) → localidades 111..115
  ('Ushuaia', 9410, 23), ('Río Grande', 9420, 23), ('Tolhuin', 9412, 23), ('Puerto Almanza', 9411, 23), ('Lago Escondido', 9413, 23),
  -- Tucumán (ID 24) → localidades 116..120
  ('San Miguel de Tucumán', 4000, 24), ('Yerba Buena', 4107, 24), ('Tafí del Valle', 4137, 24), ('Concepción', 4146, 24), ('Lules', 4128, 24);

-- ============================================================
-- 3. ROLES Y OBRAS SOCIALES
-- Roles:        1=ADMIN, 2=MEDICO, 3=ENFERMERO
-- Obras sociales: 1=OSDE, 2=Swiss Medical, 3=PAMI, 4=IOMA, 5=Galeno
-- ============================================================
INSERT INTO rol (nombre_rol) VALUES ('ADMIN'), ('MEDICO'), ('ENFERMERO');
INSERT INTO obra_social (nombre_obra) VALUES ('OSDE'), ('Swiss Medical'), ('PAMI'), ('IOMA'), ('Galeno');

-- ============================================================
-- 4. TABLAS MAESTRAS MÉDICAS
-- Alergias:              1=Penicilina, 2=Polen, 3=Látex, 4=Aspirina, 5=Frutos Secos
-- Enfermedades crónicas: 1=HTA, 2=Asma, 3=Diabetes2, 4=EPOC, 5=Hipotiroidismo
-- Antecedentes:          1=Diabetes2, 2=Hipertensión, 3=Cardiopatía, 4=Cáncer colon, 5=Alzheimer
-- ============================================================
INSERT INTO alergia (nombre_alergia) VALUES ('Penicilina'), ('Polen'), ('Látex'), ('Aspirina'), ('Frutos Secos');
INSERT INTO enfermedad_cronica (nombre_enfermedad) VALUES ('Hipertensión arterial'), ('Asma leve'), ('Diabetes tipo 2'), ('EPOC'), ('Hipotiroidismo');
INSERT INTO antecedente_familiar (nombre_enfermedad) VALUES ('Diabetes tipo 2'), ('Hipertensión'), ('Cardiopatía'), ('Cáncer de colon'), ('Alzheimer');

-- ============================================================
-- 5. PERSONAS (10 Pacientes + 2 Staff)
-- IDs resultantes: 1..12
--   1=Juan Pérez        (paciente)
--   2=María García      (paciente)
--   3=Ricardo Darín     (paciente)
--   4=Antonela Roccuzzo (paciente)
--   5=Lionel Messi      (paciente)
--   6=Tini Stoessel     (paciente)
--   7=Bizarrap Gonzalo  (paciente)
--   8=Lali Espósito     (paciente)
--   9=Duki Mauro        (paciente)
--  10=Nicki Nicole      (paciente)
--  11=Claudia Medina    (staff/médico)
--  12=Roberto Admin     (staff/admin) ← usuario admin@hospital.com
-- ============================================================
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

-- ============================================================
-- 6. DOMICILIOS (10 para pacientes)
-- Localidades usadas: 1 (La Plata), 6 (Palermo), 76 (Viedma),
--   26 (Córdoba Capital), 31 (Corrientes Capital), 51 (Santa Rosa),
--   61 (Mendoza Capital), 96 (Río Gallegos), 46 (San Salvador Jujuy),
--   101 (Santa Fe Capital)
-- IDs resultantes: 1..10
-- ============================================================
INSERT INTO domicilio (calle, numero, id_localidad) VALUES
  ('Av. 7',         1234, 1),   -- id_direccion = 1  → La Plata
  ('Florida',         50, 6),   -- id_direccion = 2  → Palermo
  ('Av. Sarmiento', 2500, 76),  -- id_direccion = 3  → Viedma
  ('9 de Julio',     900, 26),  -- id_direccion = 4  → Córdoba Capital
  ('Belgrano',       400, 31),  -- id_direccion = 5  → Corrientes Capital
  ('San Martín',     101, 51),  -- id_direccion = 6  → Santa Rosa
  ('Av. Colón',       88, 61),  -- id_direccion = 7  → Mendoza Capital
  ('Las Heras',      450, 96),  -- id_direccion = 8  → Río Gallegos
  ('Rivadavia',       33, 46),  -- id_direccion = 9  → San Salvador de Jujuy
  ('O''Higgins',     500, 101); -- id_direccion = 10 → Santa Fe Capital

-- ============================================================
-- 7. RESIDENCIAS (1 por domicilio)
-- IDs resultantes: 1..10 (SELECT garantiza el mismo orden)
-- ============================================================
INSERT INTO residencia (tipo_residencia, id_direccion)
SELECT 'permanente', id_direccion FROM domicilio ORDER BY id_direccion;

-- ============================================================
-- 8. FICHAS MÉDICAS (10, una por paciente)
-- IDs resultantes: 1..10
-- ============================================================
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

-- ============================================================
-- 9. AFILIACIONES A OBRA SOCIAL (10, una por paciente)
-- IDs resultantes: 1..10
-- ============================================================
INSERT INTO afiliacion_obra_social (numero_afiliado, id_obra_social) VALUES
  ('10001', 1), ('20002', 2), ('30003', 3), ('40004', 4), ('50005', 5),
  ('60006', 1), ('70007', 2), ('80008', 3), ('90009', 4), ('10101', 5);

-- ============================================================
-- 10. PACIENTES
-- Alineación: persona i → residencia i → ficha i → afiliacion i
-- IDs resultantes: 1..10
-- ============================================================
INSERT INTO paciente (dni, id_persona, id_residencia, id_ficha_medica, id_afiliacion) VALUES
  (30000001, 1,  1,  1,  1),
  (30000002, 2,  2,  2,  2),
  (30000003, 3,  3,  3,  3),
  (30000004, 4,  4,  4,  4),
  (30000005, 5,  5,  5,  5),
  (30000006, 6,  6,  6,  6),
  (30000007, 7,  7,  7,  7),
  (30000008, 8,  8,  8,  8),
  (30000009, 9,  9,  9,  9),
  (30000010, 10, 10, 10, 10);

-- ============================================================
-- 11. TABLAS DE NEXO N:M (esquema refactorizado)
-- ficha_alergia              → id_ficha_medica + id_alergia
-- ficha_enfermedad_cronica   → id_ficha_medica + id_enfermedad_cronica
-- ficha_antecedente_familiar → id_ficha_medica + id_antecedente_familiar
-- ============================================================
-- Alergias: ficha 1 → Penicilina; ficha 3 → Látex; ficha 5 → Frutos Secos
INSERT INTO ficha_alergia (id_ficha_medica, id_alergia) VALUES
  (1, 1), -- Juan Pérez → Penicilina
  (2, 2), -- María García → Polen
  (3, 3), -- Ricardo Darín → Látex
  (5, 5), -- Lionel Messi → Frutos Secos
  (8, 4); -- Lali Espósito → Aspirina

-- Enfermedades crónicas: ficha 1 → HTA; ficha 3 → Diabetes; ficha 9 → Asma
INSERT INTO ficha_enfermedad_cronica (id_ficha_medica, id_enfermedad_cronica) VALUES
  (1, 1), -- Juan Pérez → Hipertensión arterial
  (3, 3), -- Ricardo Darín → Diabetes tipo 2
  (5, 4), -- Lionel Messi → EPOC
  (9, 2); -- Duki Mauro → Asma leve

-- Antecedentes familiares: ficha 1 → HTA; ficha 3 → Diabetes; ficha 6 → Cáncer colon
INSERT INTO ficha_antecedente_familiar (id_ficha_medica, id_antecedente_familiar) VALUES
  (1, 2), -- Juan Pérez → Hipertensión familiar
  (3, 1), -- Ricardo Darín → Diabetes familiar
  (6, 4), -- Tini Stoessel → Cáncer de colon
  (9, 3); -- Duki Mauro → Cardiopatía familiar

-- ============================================================
-- 12. USUARIOS
-- admin@hospital.com  → id_persona=12 (Roberto Admin),  rol=1 (ADMIN)
-- claudia@hospital.com → id_persona=11 (Claudia Medina), rol=2 (MEDICO)
-- NOTA: Sin Spring Security activo, 'pass' es texto plano comparado desde frontend.
--       Al implementar BCrypt, reemplazar estos valores por hashes correspondientes.
-- ============================================================
INSERT INTO usuario (email, pass, id_rol, id_persona, autorizacion) VALUES
  ('admin@hospital.com',   'hash_admin',  1, 12, 'FULL_ACCESS'),
  ('claudia@hospital.com', 'hash_medico', 2, 11, 'READ_WRITE');

-- ============================================================
-- 13. DATOS ADICIONALES DE SOPORTE
-- ============================================================
INSERT INTO habitacion_internacion (numero_habitacion, piso_habitacion, estado_habitacion) VALUES
  ('101', 1, 'disponible'), ('102', 1, 'disponible'), ('201', 2, 'disponible');

INSERT INTO tipo_procedimiento (nombre_tipo_procedimiento) VALUES
  ('Consulta clínica'), ('Extracción de sangre'), ('Radiografía');

SET session_replication_role = DEFAULT;

-- ============================================================
-- VERIFICACIÓN RÁPIDA (descomentar para validar)
-- ============================================================
/*
SELECT 'provincias'              AS tabla, COUNT(*) AS total FROM provincia
UNION ALL SELECT 'localidades',           COUNT(*) FROM localidad
UNION ALL SELECT 'roles',                 COUNT(*) FROM rol
UNION ALL SELECT 'obras_sociales',        COUNT(*) FROM obra_social
UNION ALL SELECT 'alergias',              COUNT(*) FROM alergia
UNION ALL SELECT 'enfermedades_cronicas', COUNT(*) FROM enfermedad_cronica
UNION ALL SELECT 'antecedentes_famil.',   COUNT(*) FROM antecedente_familiar
UNION ALL SELECT 'personas',              COUNT(*) FROM persona
UNION ALL SELECT 'domicilios',            COUNT(*) FROM domicilio
UNION ALL SELECT 'residencias',           COUNT(*) FROM residencia
UNION ALL SELECT 'fichas_medicas',        COUNT(*) FROM ficha_medica
UNION ALL SELECT 'afiliaciones',          COUNT(*) FROM afiliacion_obra_social
UNION ALL SELECT 'pacientes',             COUNT(*) FROM paciente
UNION ALL SELECT 'ficha_alergia (N:M)',   COUNT(*) FROM ficha_alergia
UNION ALL SELECT 'ficha_enf_cronica(NM)', COUNT(*) FROM ficha_enfermedad_cronica
UNION ALL SELECT 'ficha_antec_fam (N:M)', COUNT(*) FROM ficha_antecedente_familiar
UNION ALL SELECT 'usuarios',              COUNT(*) FROM usuario
UNION ALL SELECT 'habitaciones',          COUNT(*) FROM habitacion_internacion
UNION ALL SELECT 'tipo_procedimientos',   COUNT(*) FROM tipo_procedimiento;
*/