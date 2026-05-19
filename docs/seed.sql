-- ============================================================
-- SEED EXTENDIDO - Clinicks / Sistema de Gestión Médica
-- PostgreSQL / Supabase
--
-- Usar después de ejecutar schema.sql sobre una base vacía.
-- Si la base ya tiene datos, usar reset_and_seed_extendido_clinicks_ROLES_FIX.sql.
-- Contraseña predeterminada usuarios demo: Admin123456
-- ============================================================

BEGIN;

-- ============================================================
-- 2. TABLAS MAESTRAS
-- ============================================================

INSERT INTO provincia (nombre_provincia) VALUES
  ('Buenos Aires'), ('Ciudad Autónoma de Buenos Aires'), ('Catamarca'), ('Chaco'),
  ('Chubut'), ('Córdoba'), ('Corrientes'), ('Entre Ríos'), ('Formosa'), ('Jujuy'),
  ('La Pampa'), ('La Rioja'), ('Mendoza'), ('Misiones'), ('Neuquén'), ('Río Negro'),
  ('Salta'), ('San Juan'), ('San Luis'), ('Santa Cruz'), ('Santa Fe'),
  ('Santiago del Estero'), ('Tierra del Fuego'), ('Tucumán');

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
  ('Posadas', 3300, 14), ('Oberá', 3360, 14), ('Eldorado', 3380, 14), ('Puerto Iguazú', 3370, 14), ('Apóstoles', 3350, 14),
  ('Neuquén Capital', 8300, 15), ('Cutral Có', 8322, 15), ('Zapala', 8340, 15), ('San Martín de los Andes', 8370, 15), ('Plottier', 8316, 15),
  ('Viedma', 8500, 16), ('Bariloche', 8400, 16), ('General Roca', 8332, 16), ('Cipolletti', 8324, 16), ('Villa Regina', 8336, 16),
  ('Salta Capital', 4400, 17), ('Orán', 4530, 17), ('Tartagal', 4560, 17), ('Metán', 4440, 17), ('Cafayate', 4427, 17),
  ('San Juan Capital', 5400, 18), ('Rawson San Juan', 5425, 18), ('Chimbas', 5413, 18), ('Pocito', 5427, 18), ('Jáchal', 5460, 18),
  ('San Luis Capital', 5700, 19), ('Villa Mercedes', 5730, 19), ('Merlo', 5881, 19), ('La Punta', 5710, 19), ('Justo Daract', 5738, 19),
  ('Río Gallegos', 9400, 20), ('Caleta Olivia', 9011, 20), ('El Calafate', 9405, 20), ('Puerto Deseado', 9050, 20), ('Pico Truncado', 9015, 20),
  ('Santa Fe Capital', 3000, 21), ('Rosario', 2000, 21), ('Rafaela', 2300, 21), ('Venado Tuerto', 2600, 21), ('Reconquista', 3560, 21),
  ('Santiago del Estero Capital', 4200, 22), ('La Banda', 4300, 22), ('Termas de Río Hondo', 4220, 22), ('Frías', 4230, 22), ('Añatuya', 3760, 22),
  ('Ushuaia', 9410, 23), ('Río Grande', 9420, 23), ('Tolhuin', 9425, 23), ('Puerto Almanza', 9411, 23), ('San Sebastián', 9421, 23),
  ('San Miguel de Tucumán', 4000, 24), ('Yerba Buena', 4107, 24), ('Tafí Viejo', 4103, 24), ('Concepción', 4146, 24), ('Aguilares', 4152, 24);

INSERT INTO obra_social (nombre_obra) VALUES
  ('Sin obra social'),
  ('OSDE'),
  ('Swiss Medical'),
  ('Galeno'),
  ('Medifé'),
  ('Sancor Salud'),
  ('IOMA'),
  ('PAMI'),
  ('OSPE'),
  ('Jerárquicos Salud');

-- Roles respetando el seed/schema actual:
-- 1=ADMINISTRADOR, 2=ADMINISTRATIVO, 3=MEDICO, 4=ENFERMERO
INSERT INTO rol (nombre_rol) VALUES
  ('ADMINISTRADOR'),
  ('ADMINISTRATIVO'),
  ('MEDICO'),
  ('ENFERMERO');

-- IDs fijos referencidos en secciones 9.x:
--  1=Consulta médica, 2=Control clínico, 3=Laboratorio, 4=Imagenología,
--  5=Vacunación, 6=Prescripción de medicación, 7=Derivación,
--  8=Internación, 9=Evolución internación, 10=Alta médica,
--  11=Cirugía, 12=Guardia, 13=Kinesiología, 14=Curación,
--  15=Registro administrativo, 16=Apertura de historial, 17=Traslado de habitación
INSERT INTO tipo_procedimiento (nombre_tipo_procedimiento) VALUES
  ('Consulta médica'),
  ('Control clínico'),
  ('Laboratorio'),
  ('Imagenología'),
  ('Vacunación'),
  ('Prescripción de medicación'),
  ('Derivación'),
  ('Internación'),
  ('Evolución internación'),
  ('Alta médica'),
  ('Cirugía'),
  ('Guardia'),
  ('Kinesiología'),
  ('Curación'),
  ('Registro administrativo'),
  ('Apertura de historial'),
  ('Traslado de habitación');

INSERT INTO alergia (nombre_alergia) VALUES
  ('Penicilina'),
  ('Ibuprofeno'),
  ('Dipirona'),
  ('Aspirina'),
  ('Látex'),
  ('Polen'),
  ('Ácaros'),
  ('Mariscos'),
  ('Maní'),
  ('Contraste yodado'),
  ('Sulfas'),
  ('Amoxicilina');

INSERT INTO enfermedad_cronica (nombre_enfermedad) VALUES
  ('Hipertensión arterial'),
  ('Diabetes tipo 2'),
  ('Asma'),
  ('Hipotiroidismo'),
  ('EPOC'),
  ('Enfermedad renal crónica'),
  ('Epilepsia'),
  ('Artritis reumatoidea'),
  ('Dislipemia'),
  ('Insuficiencia cardíaca');

INSERT INTO antecedente_familiar (nombre_enfermedad) VALUES
  ('Diabetes familiar'),
  ('Hipertensión familiar'),
  ('Cáncer de mama familiar'),
  ('Cáncer de colon familiar'),
  ('Cardiopatía isquémica familiar'),
  ('ACV familiar'),
  ('Asma familiar'),
  ('Enfermedad tiroidea familiar');

-- ============================================================
-- 3. PERSONAL DEL SISTEMA
-- ============================================================

-- IDs resultantes:
-- 1=Admin Clinicks, 2=Roberto Admin, 3=Claudia Medina, 4=Laura Enfermera.
-- Los pacientes arrancan en persona 5.
INSERT INTO persona (nombre_persona, apellido_persona, fecha_nacimiento) VALUES
  ('Admin',   'Clinicks',  '1990-01-01'),
  ('Roberto', 'Admin',     '1980-06-15'),
  ('Claudia', 'Medina',    '1982-04-20'),
  ('Laura',   'Enfermera', '1990-03-15');

-- Contraseña predeterminada para usuarios de demo: Admin123456
-- Hash BCrypt usado por el seed actual:
-- $2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K
INSERT INTO usuario (email, pass, autorizacion, id_rol, id_persona, must_change_password) VALUES
  ('admin@clinicks.com',     '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K', 'ACTIVO', 1, 1, FALSE),
  ('admin@hospital.com',     '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K', 'ACTIVO', 2, 2, TRUE),
  ('claudia@hospital.com',   '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K', 'ACTIVO', 3, 3, TRUE),
  ('enfermera@hospital.com', '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K', 'ACTIVO', 4, 4, TRUE);

INSERT INTO invitacion_registro (email, token, id_rol, id_usuario_creador, fecha_expiracion)
VALUES
  ('nuevo.medico@clinicks.com', 'INV-DEMO-MEDICO-001', 3, 1, NOW() + INTERVAL '7 days'),
  ('nueva.enfermera@clinicks.com', 'INV-DEMO-ENF-001', 4, 1, NOW() + INTERVAL '7 days');

-- ============================================================
-- 4. HOSPITAL: 7 PISOS, 40 HABITACIONES
--    Numeración: 101..706, distribuida en 7 pisos.
-- ============================================================

WITH habitaciones AS (
  SELECT
    gs AS n,
    CASE
      WHEN gs <= 6 THEN 1
      WHEN gs <= 12 THEN 2
      WHEN gs <= 18 THEN 3
      WHEN gs <= 24 THEN 4
      WHEN gs <= 30 THEN 5
      WHEN gs <= 36 THEN 6
      ELSE 7
    END AS piso
  FROM generate_series(1, 40) gs
)
INSERT INTO habitacion_internacion (numero_habitacion, piso_habitacion, estado_habitacion)
SELECT
  (piso::text || LPAD(((n - 1) % 6 + 1)::text, 2, '0')) AS numero_habitacion,
  piso AS piso_habitacion,
  CASE
    WHEN n IN (5, 16, 27, 38) THEN 'mantenimiento'
    ELSE 'disponible'
  END AS estado_habitacion
FROM habitaciones;
-- Nota: el estado 'ocupada' se asigna más abajo, después de insertar las internaciones activas.

-- ============================================================
-- 5. 50 PACIENTES + FICHAS + AFILIACIÓN + DOMICILIO
-- ============================================================

CREATE TEMP TABLE tmp_pacientes_seed (
  nro INT PRIMARY KEY,
  dni INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  apellido VARCHAR(200) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo CHAR(1) NOT NULL,
  localidad_id INT NOT NULL,
  calle VARCHAR(200) NOT NULL,
  numero INT NOT NULL,
  piso INT,
  tipo_sangre VARCHAR(3) NOT NULL,
  id_obra_social INT NOT NULL,
  antecedentes_text TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_pacientes_seed
(nro, dni, nombre, apellido, fecha_nacimiento, sexo, localidad_id, calle, numero, piso, tipo_sangre, id_obra_social, antecedentes_text)
VALUES
  (1, 32100101, 'Juan', 'Ramírez', '1989-04-12', 'M', 16, 'Av. 9 de Julio', 1450, NULL, 'O+', 2, 'Padre con hipertensión arterial. Madre sin antecedentes relevantes.'),
  (2, 29876421, 'María', 'González', '1984-10-03', 'F', 16, 'French', 842, 2, 'A+', 3, 'Abuela materna con diabetes tipo 2.'),
  (3, 41234567, 'Lucía', 'Fernández', '1997-02-19', 'F', 17, 'Mitre', 230, NULL, 'B+', 1, 'Sin antecedentes familiares significativos.'),
  (4, 27654321, 'Carlos', 'Pereyra', '1979-08-25', 'M', 18, 'Sarmiento', 1555, 1, 'O-', 4, 'Padre con cardiopatía isquémica.'),
  (5, 35456789, 'Ana', 'Aguirre', '1991-12-30', 'F', 19, 'Belgrano', 902, NULL, 'AB+', 5, 'Madre con enfermedad tiroidea.'),
  (6, 18765432, 'Roberto', 'López', '1966-05-14', 'M', 20, 'San Martín', 3020, NULL, 'A-', 8, 'Padre fallecido por ACV.'),
  (7, 45987654, 'Camila', 'Silva', '2001-09-09', 'F', 31, 'Junín', 480, 3, 'O+', 6, 'Hermano con asma.'),
  (8, 33445566, 'Federico', 'Torres', '1988-01-27', 'M', 32, 'España', 611, NULL, 'B-', 7, 'Antecedentes familiares de hipertensión.'),
  (9, 24681357, 'Patricia', 'Molina', '1975-07-07', 'F', 33, 'La Rioja', 123, 4, 'A+', 3, 'Madre con cáncer de mama.'),
  (10, 39246810, 'Nicolás', 'Castro', '1994-03-21', 'M', 34, 'San Lorenzo', 775, NULL, 'O+', 1, 'Sin antecedentes familiares declarados.'),
  (11, 30777111, 'Florencia', 'Duarte', '1986-11-11', 'F', 35, 'Rivadavia', 2200, 5, 'AB-', 2, 'Padre con diabetes tipo 2.'),
  (12, 22111222, 'Miguel', 'Sosa', '1971-06-18', 'M', 36, 'Urquiza', 931, NULL, 'O+', 8, 'Cardiopatía familiar por rama paterna.'),
  (13, 43888123, 'Valentina', 'Ríos', '1999-12-02', 'F', 37, 'Moreno', 402, NULL, 'A+', 5, 'Sin antecedentes familiares relevantes.'),
  (14, 36999123, 'Agustín', 'Núñez', '1992-04-29', 'M', 38, 'Pellegrini', 1020, 7, 'B+', 4, 'Madre con hipotiroidismo.'),
  (15, 25555123, 'Graciela', 'Morales', '1978-02-13', 'F', 39, 'Italia', 721, NULL, 'O-', 9, 'Abuelo con cáncer de colon.'),
  (16, 19333123, 'Oscar', 'Vera', '1962-09-30', 'M', 40, 'Brown', 1888, NULL, 'A+', 8, 'Padre con EPOC e hipertensión.'),
  (17, 40123456, 'Julieta', 'Cáceres', '1996-08-16', 'F', 41, 'Entre Ríos', 156, 1, 'O+', 10, 'Asma familiar.'),
  (18, 31678901, 'Matías', 'Romero', '1987-10-24', 'M', 42, 'Córdoba', 890, NULL, 'B+', 6, 'Sin antecedentes.'),
  (19, 28456701, 'Paula', 'Medina', '1981-05-06', 'F', 43, 'Corrientes', 2077, 6, 'A-', 2, 'Madre con diabetes.'),
  (20, 23888999, 'Héctor', 'Benítez', '1973-12-20', 'M', 44, 'Tucumán', 144, NULL, 'O+', 7, 'ACV familiar.'),
  (21, 46789123, 'Brenda', 'Acosta', '2003-01-04', 'F', 45, 'Salta', 333, NULL, 'AB+', 1, 'Sin antecedentes.'),
  (22, 35222111, 'Sebastián', 'Ortega', '1990-07-15', 'M', 46, 'Güemes', 1500, 2, 'O-', 3, 'Hipertensión familiar.'),
  (23, 30222999, 'Carolina', 'Navarro', '1985-09-01', 'F', 47, 'Alvear', 804, NULL, 'A+', 4, 'Enfermedad tiroidea familiar.'),
  (24, 17444111, 'Alberto', 'Ibarra', '1959-03-10', 'M', 48, 'Maipú', 66, NULL, 'B-', 8, 'Cardiopatía isquémica familiar.'),
  (25, 42777123, 'Milagros', 'Herrera', '1998-06-22', 'F', 49, 'Saavedra', 970, 8, 'O+', 5, 'Sin antecedentes.'),
  (26, 38999123, 'Tomás', 'Leiva', '1993-02-28', 'M', 50, 'Lavalle', 410, NULL, 'A+', 2, 'Padre con hipertensión.'),
  (27, 21444123, 'Susana', 'Paz', '1969-11-07', 'F', 51, 'Avellaneda', 2345, NULL, 'O+', 8, 'Madre con diabetes y ACV.'),
  (28, 37222123, 'Iván', 'Coronel', '1992-05-13', 'M', 52, 'Independencia', 501, 3, 'AB-', 6, 'Sin antecedentes familiares relevantes.'),
  (29, 29999111, 'Daniela', 'Mansilla', '1983-01-26', 'F', 53, 'Catamarca', 199, NULL, 'B+', 3, 'Cáncer de mama familiar.'),
  (30, 26666123, 'Marcelo', 'Farias', '1977-10-30', 'M', 54, 'Jujuy', 1770, NULL, 'O-', 9, 'Padre con insuficiencia cardíaca.'),
  (31, 44444123, 'Rocío', 'Vargas', '2000-04-05', 'F', 55, 'Formosa', 750, 1, 'A+', 1, 'Sin antecedentes.'),
  (32, 33333123, 'Emanuel', 'Cabrera', '1988-08-08', 'M', 56, 'Misiones', 301, NULL, 'O+', 10, 'Asma familiar.'),
  (33, 20123123, 'Marta', 'Godoy', '1965-12-11', 'F', 57, 'Santa Fe', 1222, NULL, 'B-', 8, 'Diabetes familiar.'),
  (34, 47777123, 'Santiago', 'Arias', '2004-07-17', 'M', 58, 'Chaco', 698, NULL, 'AB+', 1, 'Sin antecedentes.'),
  (35, 28888123, 'Andrea', 'Roldán', '1980-09-27', 'F', 59, 'Mendoza', 233, 5, 'A-', 4, 'Madre con hipotiroidismo.'),
  (36, 23333123, 'Raúl', 'Cano', '1972-02-02', 'M', 60, 'San Juan', 1599, NULL, 'O+', 7, 'Cardiopatía familiar.'),
  (37, 39999124, 'Noelia', 'Escobar', '1995-06-19', 'F', 61, 'La Pampa', 1001, NULL, 'B+', 2, 'Sin antecedentes.'),
  (38, 31111124, 'Pablo', 'Villalba', '1986-03-31', 'M', 62, 'Neuquén', 711, 6, 'A+', 5, 'Hipertensión familiar.'),
  (39, 27777124, 'Silvina', 'Quiroga', '1979-05-21', 'F', 63, 'Río Negro', 180, NULL, 'O-', 3, 'ACV familiar.'),
  (40, 45555124, 'Lautaro', 'Ferreyra', '2002-10-10', 'M', 64, 'San Luis', 426, NULL, 'O+', 1, 'Sin antecedentes.'),
  (41, 34444124, 'Romina', 'Giménez', '1989-07-23', 'F', 65, 'Entre Ríos', 780, 9, 'AB-', 6, 'Enfermedad tiroidea familiar.'),
  (42, 18888124, 'Jorge', 'Alderete', '1964-01-15', 'M', 66, 'Tierra del Fuego', 930, NULL, 'A+', 8, 'Padre con EPOC.'),
  (43, 42222124, 'Micaela', 'Serrano', '1997-11-29', 'F', 67, 'Tucumán', 505, NULL, 'B+', 9, 'Cáncer de colon familiar.'),
  (44, 36666124, 'Franco', 'Ojeda', '1991-04-09', 'M', 68, 'Buenos Aires', 2050, 4, 'O+', 2, 'Sin antecedentes.'),
  (45, 24444124, 'Norma', 'Toledo', '1976-06-03', 'F', 69, 'CABA', 611, NULL, 'A-', 7, 'Madre con diabetes.'),
  (46, 30000124, 'Gustavo', 'Luna', '1985-12-24', 'M', 70, 'Catamarca', 1488, NULL, 'O+', 3, 'Hipertensión familiar.'),
  (47, 49123124, 'Martina', 'Vega', '2005-02-14', 'F', 71, 'Chubut', 111, NULL, 'AB+', 1, 'Sin antecedentes.'),
  (48, 38777124, 'Cristian', 'Peralta', '1993-09-05', 'M', 72, 'Córdoba', 912, 2, 'B-', 5, 'Asma familiar.'),
  (49, 26666124, 'Lorena', 'Maidana', '1977-08-18', 'F', 73, 'Corrientes', 1717, NULL, 'A+', 4, 'Cardiopatía familiar.'),
  (50, 21111124, 'Enrique', 'Barrios', '1968-03-03', 'M', 74, 'Chaco', 2525, NULL, 'O-', 8, 'ACV y diabetes familiar.');

-- Fichas médicas
INSERT INTO ficha_medica (tipo_sangre, antecedentes_familiares_text)
SELECT tipo_sangre, antecedentes_text
FROM tmp_pacientes_seed
ORDER BY nro;

-- Afiliaciones, salvo pacientes con "Sin obra social" (id_obra_social = 1)
INSERT INTO afiliacion_obra_social (numero_afiliado, fecha_alta, fecha_vencimiento, id_obra_social)
SELECT
  'AF-' || LPAD(nro::text, 4, '0') || '-' || dni::text,
  (CURRENT_DATE - ((nro * 37) || ' days')::interval)::date,
  CASE WHEN nro % 9 = 0 THEN (CURRENT_DATE + INTERVAL '180 days')::date ELSE NULL END,
  id_obra_social
FROM tmp_pacientes_seed
WHERE id_obra_social <> 1
ORDER BY nro;

-- Domicilios y residencias
INSERT INTO domicilio (calle, numero, piso, id_localidad)
SELECT calle, numero, piso, localidad_id
FROM tmp_pacientes_seed
ORDER BY nro;

INSERT INTO residencia (tipo_residencia, id_direccion)
SELECT
  CASE WHEN nro IN (7, 21, 34, 47) THEN 'transitorio' ELSE 'permanente' END,
  nro
FROM tmp_pacientes_seed
ORDER BY nro;

-- Personas pacientes
INSERT INTO persona (nombre_persona, apellido_persona, fecha_nacimiento)
SELECT nombre, apellido, fecha_nacimiento::timestamp
FROM tmp_pacientes_seed
ORDER BY nro;

-- Pacientes: las personas 1..4 son usuarios, por eso pacientes arrancan en persona 5
INSERT INTO paciente (dni, id_persona, id_residencia, id_ficha_medica, id_afiliacion)
SELECT
  p.dni,
  p.nro + 4 AS id_persona,
  p.nro AS id_residencia,
  p.nro AS id_ficha_medica,
  CASE
    WHEN p.id_obra_social = 1 THEN NULL
    ELSE (
      SELECT a.id_afiliacion
      FROM afiliacion_obra_social a
      WHERE a.numero_afiliado = 'AF-' || LPAD(p.nro::text, 4, '0') || '-' || p.dni::text
      LIMIT 1
    )
  END AS id_afiliacion
FROM tmp_pacientes_seed p
ORDER BY p.nro;

-- ============================================================
-- 6. DATOS CLÍNICOS DE FICHA: alergias, crónicas, antecedentes
-- ============================================================

-- Alergias: no todos tienen, algunos tienen más de una.
INSERT INTO ficha_alergia (id_ficha_medica, id_alergia)
SELECT nro, ((nro * 2) % 12) + 1
FROM tmp_pacientes_seed
WHERE nro % 3 = 0 OR nro IN (1, 5, 9, 14, 22, 31, 43)
UNION
SELECT nro, ((nro * 5) % 12) + 1
FROM tmp_pacientes_seed
WHERE nro % 10 = 0 OR nro IN (6, 17, 29, 41);

-- Enfermedades crónicas: más frecuente en adultos mayores, pero variado.
INSERT INTO ficha_enfermedad_cronica (id_ficha_medica, id_enfermedad_cronica)
SELECT nro, ((nro * 3) % 10) + 1
FROM tmp_pacientes_seed
WHERE fecha_nacimiento <= DATE '1988-12-31' OR nro IN (7, 22, 37, 48)
UNION
SELECT nro, ((nro * 7) % 10) + 1
FROM tmp_pacientes_seed
WHERE nro IN (6, 12, 16, 24, 27, 30, 33, 36, 42, 50);

-- Antecedentes familiares codificados.
INSERT INTO ficha_antecedente_familiar (id_ficha_medica, id_antecedente_familiar)
SELECT nro, ((nro * 4) % 8) + 1
FROM tmp_pacientes_seed
WHERE nro % 2 = 0 OR nro IN (9, 15, 23, 29, 35, 41, 43, 49)
UNION
SELECT nro, ((nro * 5) % 8) + 1
FROM tmp_pacientes_seed
WHERE nro IN (4, 6, 12, 20, 24, 27, 33, 39, 42, 50);

-- Contactos de emergencia: todos tienen 1, algunos tienen 2.
INSERT INTO contacto_emergencia (id_paciente, nombre_completo, parentesco, telefono_celular)
SELECT
  nro,
  CASE
    WHEN sexo = 'F' THEN 'Carlos ' || apellido
    ELSE 'María ' || apellido
  END,
  CASE
    WHEN nro % 5 = 0 THEN 'Hermano/a'
    WHEN nro % 4 = 0 THEN 'Hijo/a'
    WHEN nro % 3 = 0 THEN 'Padre/Madre'
    ELSE 'Cónyuge'
  END,
  '+54 3624 ' || LPAD((700000 + nro * 137)::text, 6, '0')
FROM tmp_pacientes_seed
ORDER BY nro;

INSERT INTO contacto_emergencia (id_paciente, nombre_completo, parentesco, telefono_celular)
SELECT
  nro,
  CASE
    WHEN sexo = 'F' THEN 'Lucía ' || apellido
    ELSE 'Juan ' || apellido
  END,
  'Contacto alternativo',
  '+54 3624 ' || LPAD((810000 + nro * 139)::text, 6, '0')
FROM tmp_pacientes_seed
WHERE nro % 7 = 0 OR nro IN (1, 6, 12, 24, 33, 50)
ORDER BY nro;

-- Teléfonos personales y algunos de emergencia.
INSERT INTO telefono (numero_telefono, tipo_telefono, id_paciente)
SELECT '+54 3624 ' || LPAD((500000 + nro * 101)::text, 6, '0'), 'personal', nro
FROM tmp_pacientes_seed
ORDER BY nro;

INSERT INTO telefono (numero_telefono, tipo_telefono, id_paciente)
SELECT '+54 3624 ' || LPAD((600000 + nro * 103)::text, 6, '0'), 'emergencia', nro
FROM tmp_pacientes_seed
WHERE nro % 4 = 0 OR nro IN (1, 2, 3, 50)
ORDER BY nro;

-- ============================================================
-- 7. HISTORIALES CLÍNICOS: 1 POR PACIENTE
-- ============================================================

INSERT INTO historial_medico (fecha_creacion, fecha_actualizacion, observaciones, estado_historial, id_paciente)
SELECT
  (CURRENT_DATE - ((nro % 31) || ' years')::interval - ((nro * 11) || ' days')::interval)::timestamp,
  (CURRENT_DATE - ((nro % 15) || ' days')::interval)::timestamp,
  CASE
    WHEN nro % 10 = 0 THEN 'Historial extenso con internaciones, controles periódicos y seguimiento por patologías crónicas.'
    WHEN nro % 4 = 0 THEN 'Historial con controles clínicos intermitentes y estudios complementarios.'
    WHEN nro % 3 = 0 THEN 'Historial breve con consultas aisladas.'
    ELSE 'Historial activo sin observaciones administrativas relevantes.'
  END,
  'activo',
  nro
FROM tmp_pacientes_seed
ORDER BY nro;

-- ============================================================
-- 8. INTERNACIONES
--    22 pacientes tienen internaciones.
--    Las internaciones activas (fecha_fin IS NULL) marcan al
--    paciente como "Internado". Las cerradas quedan como historial.
-- ============================================================

CREATE TEMP TABLE tmp_internaciones_seed (
  nro INT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_historial INT NOT NULL,
  id_habitacion INT NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  motivo TEXT NOT NULL,
  diagnostico_alta TEXT
) ON COMMIT DROP;

INSERT INTO tmp_internaciones_seed (nro, id_paciente, id_historial, id_habitacion, fecha_inicio, fecha_fin, motivo, diagnostico_alta)
SELECT
  row_number() OVER (ORDER BY p.nro) AS nro,
  p.nro,
  p.nro,
  ((row_number() OVER (ORDER BY p.nro) * 3 - 2) % 40) + 1 AS id_habitacion,
  CASE
    WHEN p.nro IN (1, 6, 12, 16, 24, 30, 33, 42, 50)
      THEN (CURRENT_DATE - ((p.nro % 30 + 1) || ' years')::interval - ((p.nro * 13) || ' days')::interval)::timestamp
    ELSE (CURRENT_DATE - ((p.nro * 9 + 12) || ' days')::interval)::timestamp
  END AS fecha_inicio,
  CASE
    WHEN p.nro IN (7, 14, 22, 37, 48)
      THEN NULL
    WHEN p.nro IN (1, 6, 12, 16, 24, 30, 33, 42, 50)
      THEN (CURRENT_DATE - ((p.nro % 30 + 1) || ' years')::interval - ((p.nro * 13 - 5) || ' days')::interval)::timestamp
    ELSE (CURRENT_DATE - ((p.nro * 9 + 7) || ' days')::interval)::timestamp
  END AS fecha_fin,
  CASE
    WHEN p.nro % 5 = 0 THEN 'Internación por descompensación metabólica y control evolutivo.'
    WHEN p.nro % 4 = 0 THEN 'Internación por cuadro respiratorio agudo.'
    WHEN p.nro % 3 = 0 THEN 'Internación para observación post procedimiento.'
    ELSE 'Internación por evaluación clínica y tratamiento.'
  END AS motivo,
  CASE
    WHEN p.nro % 5 = 0 THEN 'Egreso con control diabetológico y pautas de alarma.'
    WHEN p.nro % 4 = 0 THEN 'Egreso con mejoría respiratoria y seguimiento ambulatorio.'
    WHEN p.nro % 3 = 0 THEN 'Egreso estable posterior a observación.'
    ELSE 'Egreso clínicamente estable.'
  END AS diagnostico_alta
FROM tmp_pacientes_seed p
WHERE p.nro IN (1, 4, 6, 7, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 33, 35, 37, 40, 42, 45, 48, 50);

INSERT INTO internacion (fecha_inicio, fecha_fin, cantidad_traslados, id_historial, id_habitacion_internacion)
SELECT
  fecha_inicio,
  fecha_fin,
  CASE
    WHEN fecha_fin IS NULL THEN 1
    WHEN nro % 4 = 0 THEN 2
    WHEN nro % 3 = 0 THEN 1
    ELSE 0
  END AS cantidad_traslados,
  id_historial,
  id_habitacion
FROM tmp_internaciones_seed
ORDER BY nro;

-- Marcar como 'ocupada' solo las habitaciones con internación activa (fecha_fin IS NULL).
UPDATE habitacion_internacion
SET estado_habitacion = 'ocupada'
WHERE id_habitacion_internacion IN (
  SELECT id_habitacion_internacion FROM internacion WHERE fecha_fin IS NULL
);

-- ============================================================
-- 9. REGISTROS CLÍNICOS
--    Todos los pacientes tienen historial.
--    Se generan historias cortas, medias y extensas.
-- ============================================================

-- 9.1 Apertura de historial clínico (evento automático inicial)
INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Apertura de historial clínico. Se registran datos personales, domicilio, obra social, ficha médica inicial y contacto de emergencia.',
  h.fecha_creacion,
  h.id_historial,
  16,  -- Apertura de historial
  1    -- admin@clinicks.com
FROM historial_medico h;

-- 9.2 Consulta inicial en todos los historiales
INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Consulta médica inicial. Motivo de consulta registrado, anamnesis general y examen físico básico sin signos de alarma al momento de la evaluación.',
  h.fecha_creacion + INTERVAL '1 day',
  h.id_historial,
  1,
  CASE WHEN h.id_historial % 2 = 0 THEN 2 ELSE 3 END
FROM historial_medico h;

-- 9.3 Controles periódicos variables. Algunos pacientes tendrán historial corto y otros extenso.
INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  CASE
    WHEN gs.n % 7 = 0 THEN 'Control clínico periódico. Se revisan antecedentes, signos vitales y adherencia a indicaciones previas.'
    WHEN gs.n % 7 = 1 THEN 'Solicitud de laboratorio de rutina para seguimiento general.'
    WHEN gs.n % 7 = 2 THEN 'Registro de resultados de laboratorio sin hallazgos críticos.'
    WHEN gs.n % 7 = 3 THEN 'Prescripción de medicación sintomática y recomendaciones generales.'
    WHEN gs.n % 7 = 4 THEN 'Derivación a especialidad para evaluación complementaria.'
    WHEN gs.n % 7 = 5 THEN 'Consulta por guardia. Se indican pautas de alarma y control.'
    ELSE 'Control evolutivo ambulatorio con evolución favorable.'
  END AS descripcion,
  h.fecha_creacion
    + ((gs.n * 43 + (h.id_historial % 17)) || ' days')::interval
    + ((gs.n % 6) || ' hours')::interval AS fecha_registro,
  h.id_historial,
  CASE
    WHEN gs.n % 7 = 0 THEN 2
    WHEN gs.n % 7 = 1 THEN 3
    WHEN gs.n % 7 = 2 THEN 3
    WHEN gs.n % 7 = 3 THEN 6
    WHEN gs.n % 7 = 4 THEN 7
    WHEN gs.n % 7 = 5 THEN 12
    ELSE 2
  END AS id_tipo_procedimiento,
  CASE
    WHEN gs.n % 5 = 0 THEN 4
    WHEN gs.n % 2 = 0 THEN 2
    ELSE 3
  END AS id_usuario
FROM historial_medico h
JOIN LATERAL generate_series(
  1,
  CASE
    WHEN h.id_historial % 10 = 0 THEN 36  -- historial muy extenso
    WHEN h.id_historial % 5 = 0 THEN 24   -- historial extenso
    WHEN h.id_historial % 4 = 0 THEN 14   -- historial medio
    WHEN h.id_historial % 3 = 0 THEN 5    -- historial corto
    ELSE 8
  END
) AS gs(n) ON TRUE
WHERE h.fecha_creacion + ((gs.n * 43 + (h.id_historial % 17)) || ' days')::interval <= NOW();

-- 9.4 Registros propios de internación: apertura de internación, evoluciones y alta médica.
INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Internación en habitación ' ||
  (SELECT numero_habitacion FROM habitacion_internacion hi WHERE hi.id_habitacion_internacion = i.id_habitacion) ||
  ', piso ' ||
  (SELECT piso_habitacion FROM habitacion_internacion hi WHERE hi.id_habitacion_internacion = i.id_habitacion) ||
  '. Motivo: ' || motivo,
  fecha_inicio,
  id_historial,
  8,   -- Internación
  4
FROM tmp_internaciones_seed i;

INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  CASE
    WHEN gs.n = 1 THEN 'Evolución de internación: paciente estable, se controlan signos vitales y respuesta al tratamiento.'
    WHEN gs.n = 2 THEN 'Evolución de internación: se ajusta plan terapéutico según evolución clínica.'
    ELSE 'Evolución de internación: se refuerzan cuidados de enfermería y seguimiento médico.'
  END,
  i.fecha_inicio + (gs.n || ' days')::interval,
  i.id_historial,
  9,
  CASE WHEN gs.n % 2 = 0 THEN 2 ELSE 4 END
FROM tmp_internaciones_seed i
JOIN LATERAL generate_series(
  1,
  CASE
    WHEN i.fecha_fin IS NULL THEN 3
    ELSE GREATEST(1, LEAST(5, EXTRACT(day FROM (i.fecha_fin - i.fecha_inicio))::int))
  END
) gs(n) ON TRUE;

INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Alta médica de internación. ' || diagnostico_alta ||
  ' Se entregan indicaciones, medicación, signos de alarma y fecha de control ambulatorio.',
  fecha_fin,
  id_historial,
  10,
  CASE WHEN id_paciente % 2 = 0 THEN 2 ELSE 3 END
FROM tmp_internaciones_seed
WHERE fecha_fin IS NOT NULL;

-- 9.5 Registros especiales de antecedentes alérgicos/crónicos para que se vean bien en historial.
INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Actualización de ficha médica: se registra alergia a ' || a.nombre_alergia || '.',
  h.fecha_creacion + INTERVAL '3 days',
  h.id_historial,
  15,
  2
FROM historial_medico h
JOIN ficha_alergia fa ON fa.id_ficha_medica = h.id_paciente
JOIN alergia a ON a.id_alergia = fa.id_alergia
WHERE fa.id_alergia = (
  SELECT MIN(fa2.id_alergia)
  FROM ficha_alergia fa2
  WHERE fa2.id_ficha_medica = fa.id_ficha_medica
);

INSERT INTO registro_clinico (descripcion, fecha_registro, id_historial, id_tipo_procedimiento, id_usuario)
SELECT
  'Seguimiento de enfermedad crónica: ' || ec.nombre_enfermedad || '. Se indican controles y monitoreo periódico.',
  h.fecha_creacion + INTERVAL '5 days',
  h.id_historial,
  2,
  3
FROM historial_medico h
JOIN ficha_enfermedad_cronica fec ON fec.id_ficha_medica = h.id_paciente
JOIN enfermedad_cronica ec ON ec.id_enfermedad_cronica = fec.id_enfermedad_cronica
WHERE fec.id_enfermedad_cronica = (
  SELECT MIN(fec2.id_enfermedad_cronica)
  FROM ficha_enfermedad_cronica fec2
  WHERE fec2.id_ficha_medica = fec.id_ficha_medica
);

-- Actualizar fecha_actualizacion de historiales según último registro real.
UPDATE historial_medico h
SET fecha_actualizacion = sub.max_fecha
FROM (
  SELECT id_historial, MAX(fecha_registro) AS max_fecha
  FROM registro_clinico
  GROUP BY id_historial
) sub
WHERE h.id_historial = sub.id_historial;

-- ============================================================
-- 10. RESUMEN DE CONTROL
-- ============================================================

COMMIT;

-- Consultas de verificación rápidas:
SELECT 'pacientes' AS tabla, COUNT(*) AS cantidad FROM paciente
UNION ALL SELECT 'historiales', COUNT(*) FROM historial_medico
UNION ALL SELECT 'registros_clinicos', COUNT(*) FROM registro_clinico
UNION ALL SELECT 'internaciones', COUNT(*) FROM internacion
UNION ALL SELECT 'habitaciones', COUNT(*) FROM habitacion_internacion
UNION ALL SELECT 'contactos_emergencia', COUNT(*) FROM contacto_emergencia
UNION ALL SELECT 'telefonos', COUNT(*) FROM telefono
UNION ALL SELECT 'fichas_con_alergias', COUNT(DISTINCT id_ficha_medica) FROM ficha_alergia
UNION ALL SELECT 'fichas_con_cronicas', COUNT(DISTINCT id_ficha_medica) FROM ficha_enfermedad_cronica
ORDER BY tabla;

-- Control de habitaciones por piso:
SELECT piso_habitacion, COUNT(*) AS habitaciones
FROM habitacion_internacion
GROUP BY piso_habitacion
ORDER BY piso_habitacion;

-- Control de cantidad de registros por paciente:
SELECT
  p.id_paciente,
  pe.apellido_persona || ', ' || pe.nombre_persona AS paciente,
  COUNT(rc.id_registro_clinico) AS cantidad_registros,
  MIN(rc.fecha_registro) AS primer_registro,
  MAX(rc.fecha_registro) AS ultimo_registro
FROM paciente p
JOIN persona pe ON pe.id_persona = p.id_persona
JOIN historial_medico h ON h.id_paciente = p.id_paciente
LEFT JOIN registro_clinico rc ON rc.id_historial = h.id_historial
GROUP BY p.id_paciente, pe.apellido_persona, pe.nombre_persona
ORDER BY cantidad_registros DESC, p.id_paciente;
