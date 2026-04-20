-- ============================================================
--  TABLAS SIN DEPENDENCIAS
-- ============================================================
CREATE TABLE provincia (
  id_provincia INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_provincia VARCHAR(200) NOT NULL,
  CONSTRAINT uq_provincia_nombre UNIQUE (nombre_provincia)
);

CREATE TABLE localidad (
  id_localidad INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_localidad VARCHAR(200) NOT NULL,
  codigo_postal INT NOT NULL,
  id_provincia INT NOT NULL,
  CONSTRAINT fk_localidad_provincia FOREIGN KEY (id_provincia) REFERENCES provincia(id_provincia),
  CONSTRAINT uq_localidad_codigo_postal UNIQUE (codigo_postal)
);

CREATE TABLE domicilio (
  id_direccion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calle VARCHAR(200) NOT NULL,
  numero INT NOT NULL,
  piso INT,  -- opcional (solo si es edificio)
  id_localidad INT NOT NULL,
  CONSTRAINT fk_domicilio_localidad FOREIGN KEY (id_localidad) REFERENCES localidad(id_localidad)
);

CREATE TABLE residencia (
  id_residencia INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo_residencia VARCHAR(15) NOT NULL,
  id_direccion INT NOT NULL,
  CONSTRAINT fk_residencia_direccion FOREIGN KEY (id_direccion) REFERENCES domicilio(id_direccion),
  CONSTRAINT ck_tipo_residencia CHECK (tipo_residencia IN ('permanente', 'transitorio'))
);

CREATE TABLE ficha_medica (
  id_ficha_medica INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alergias TEXT,
  enfermedades_cronicas TEXT,
  antecedente_familiar TEXT,
  tipo_sangre VARCHAR(3) NOT NULL,
  CONSTRAINT ck_tipo_sangre CHECK (tipo_sangre IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

CREATE TABLE obra_social (
  id_obra_social INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_obra VARCHAR(100) NOT NULL
);

CREATE TABLE rol (
  id_rol INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_rol VARCHAR(200) NOT NULL,
  CONSTRAINT uq_rol_nombre UNIQUE (nombre_rol)
);

CREATE TABLE tipo_procedimiento (
  id_tipo_procedimiento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_tipo_procedimiento VARCHAR(200) NOT NULL
);

CREATE TABLE habitacion_internacion (
  id_habitacion_internacion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numero_habitacion VARCHAR(4) NOT NULL,
  piso_habitacion INT NOT NULL,
  estado_habitacion VARCHAR(15) NOT NULL 
  CONSTRAINT uq_habitacion_numero UNIQUE (numero_habitacion)
  CONSTRAINT ck_estado_habitacion CHECK (estado_habitacion IN ('disponible', 'ocupada', 'mantenimiento')),
);

-- ============================================================
--  PERSONA
-- ============================================================
CREATE TABLE persona (
  id_persona INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_persona VARCHAR(200) NOT NULL,
  apellido_persona VARCHAR(200) NOT NULL,
  fecha_nacimiento TIMESTAMP NOT NULL,
  fecha_fallecimiento TIMESTAMP -- NULL mientras la persona viva
);

-- ============================================================
--  PACIENTE
-- ============================================================
CREATE TABLE paciente (
  id_paciente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dni INT NOT NULL,
  id_persona INT NOT NULL,
  id_residencia INT NOT NULL,
  id_ficha_medica INT NOT NULL,
  id_obra_social INT,  -- NULL si no tiene obra social
  CONSTRAINT fk_paciente_persona FOREIGN KEY (id_persona) REFERENCES persona(id_persona),
  CONSTRAINT fk_paciente_residencia FOREIGN KEY (id_residencia) REFERENCES residencia(id_residencia),
  CONSTRAINT fk_paciente_ficha_medica FOREIGN KEY (id_ficha_medica) REFERENCES ficha_medica(id_ficha_medica),
  CONSTRAINT fk_paciente_obra_social FOREIGN KEY (id_obra_social) REFERENCES obra_social(id_obra_social),
  CONSTRAINT uq_paciente_dni UNIQUE (dni),
  CONSTRAINT uq_paciente_residencia UNIQUE (id_residencia),  -- 1:1 con residencia
  CONSTRAINT uq_paciente_ficha_medica UNIQUE (id_ficha_medica) -- 1:1 con ficha_medica
);

CREATE TABLE telefono (
  id_telefono INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numero_telefono VARCHAR(20) NOT NULL,
  tipo_telefono VARCHAR(15) NOT NULL,
  id_paciente INT NOT NULL,
  CONSTRAINT fk_telefono_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
  CONSTRAINT uq_telefono_numero UNIQUE (numero_telefono),
  CONSTRAINT ck_tipo_telefono CHECK (tipo_telefono IN ('personal', 'emergencia'))
);

-- ============================================================
--  USUARIO
-- ============================================================
CREATE TABLE usuario (
  id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(200) NOT NULL,
  pass VARCHAR(200) NOT NULL, -- almacenar como hash
  id_rol INT NOT NULL,
  id_persona INT NOT NULL,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (id_persona) REFERENCES persona(id_persona),
  CONSTRAINT uq_usuario_email UNIQUE (email),
  CONSTRAINT ck_usuario_email_formato CHECK (email ~* '^[A-Z0-9._%+\\-]+@[A-Z0-9.\\-]+\\.[A-Z]{2,}$')
);

-- ============================================================
--  HISTORIAL MÉDICO
-- ============================================================
CREATE TABLE historial_medico (
  id_historial INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
  observaciones TEXT,
  estado_historial VARCHAR(15) NOT NULL,
  id_paciente INT NOT NULL,
  CONSTRAINT fk_historial_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente),
  CONSTRAINT ck_estado_historial CHECK (estado_historial IN ('activo', 'cerrado', 'archivado'))
);

-- Trigger: actualiza fecha_actualizacion automáticamente en cada UPDATE
CREATE OR REPLACE FUNCTION fn_actualizar_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.fecha_actualizacion = NOW();

RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_historial_updated BEFORE
UPDATE ON historial_medico FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

-- ============================================================
--  INTERNACIÓN
-- ============================================================
CREATE TABLE internacion (
  id_internacion INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,  -- NULL si el paciente sigue internado
  cantidad_traslados INT NOT NULL DEFAULT 0,
  id_historial INT NOT NULL,
  id_habitacion_internacion INT NOT NULL,
  CONSTRAINT fk_internacion_historial FOREIGN KEY (id_historial) REFERENCES historial_medico(id_historial),
  CONSTRAINT fk_internacion_habitacion FOREIGN KEY (id_habitacion_internacion) REFERENCES habitacion_internacion(id_habitacion_internacion)
);

-- ============================================================
--  REGISTRO CLÍNICO
-- ============================================================
CREATE TABLE registro_clinico (
  id_registro_clinico INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion TEXT,
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
  id_historial INT NOT NULL,
  id_tipo_procedimiento INT NOT NULL,
  id_usuario INT NOT NULL,
  CONSTRAINT fk_registro_historial FOREIGN KEY (id_historial) REFERENCES historial_medico(id_historial),
  CONSTRAINT fk_registro_tipo_procedimiento FOREIGN KEY (id_tipo_procedimiento) REFERENCES tipo_procedimiento(id_tipo_procedimiento),
  CONSTRAINT fk_registro_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================================
--  ÍNDICES — mejoran rendimiento en consultas frecuentes
-- ============================================================
CREATE INDEX idx_historial_paciente ON historial_medico(id_paciente);

CREATE INDEX idx_registro_historial ON registro_clinico(id_historial);

CREATE INDEX idx_internacion_historial ON internacion(id_historial);

CREATE INDEX idx_telefono_paciente ON telefono(id_paciente);

CREATE INDEX idx_paciente_persona ON paciente(id_persona);

CREATE INDEX idx_usuario_persona ON usuario(id_persona);

-- ============================================================
--  ROW LEVEL SECURITY (solo usuarios autenticados)
-- ============================================================
ALTER TABLE paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_clinico ENABLE ROW LEVEL SECURITY;
ALTER TABLE ficha_medica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "solo_autenticados" ON paciente FOR ALL TO authenticated USING (true);

CREATE POLICY "solo_autenticados" ON historial_medico FOR ALL TO authenticated USING (true);

CREATE POLICY "solo_autenticados" ON registro_clinico FOR ALL TO authenticated USING (true);

CREATE POLICY "solo_autenticados" ON ficha_medica FOR ALL TO authenticated USING (true);
