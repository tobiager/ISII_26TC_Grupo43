-- =========================
-- Módulo de Personas y Acceso
-- =========================

CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE persona (
    dni VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    persona_dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (persona_dni) REFERENCES persona(dni) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES rol(id)
);

CREATE INDEX idx_usuario_persona_dni ON usuario(persona_dni);
CREATE INDEX idx_usuario_rol_id ON usuario(rol_id);

-- =========================
-- Módulo Geográfico
-- =========================

CREATE TABLE provincia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE localidad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    provincia_id INT NOT NULL,
    FOREIGN KEY (provincia_id) REFERENCES provincia(id)
);

CREATE INDEX idx_localidad_provincia_id ON localidad(provincia_id);

CREATE TABLE domicilio (
    id SERIAL PRIMARY KEY,
    calle VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    localidad_id INT NOT NULL,
    FOREIGN KEY (localidad_id) REFERENCES localidad(id)
);

CREATE INDEX idx_domicilio_localidad_id ON domicilio(localidad_id);

-- =========================
-- Módulo del Paciente
-- =========================

CREATE TABLE obra_social (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

CREATE TABLE paciente (
    dni VARCHAR(20) PRIMARY KEY,
    obra_social_id INT,
    domicilio_id INT,
    FOREIGN KEY (dni) REFERENCES persona(dni) ON DELETE CASCADE,
    FOREIGN KEY (obra_social_id) REFERENCES obra_social(id),
    FOREIGN KEY (domicilio_id) REFERENCES domicilio(id)
);

CREATE INDEX idx_paciente_obra_social_id ON paciente(obra_social_id);
CREATE INDEX idx_paciente_domicilio_id ON paciente(domicilio_id);

CREATE TABLE ficha_medica (
    id SERIAL PRIMARY KEY,
    paciente_dni VARCHAR(20) NOT NULL,
    alergias TEXT,
    enfermedades_cronicas TEXT,
    antecedentes_familiares TEXT,
    tipo_sangre VARCHAR(10),
    FOREIGN KEY (paciente_dni) REFERENCES paciente(dni) ON DELETE CASCADE
);

CREATE INDEX idx_ficha_paciente_dni ON ficha_medica(paciente_dni);

CREATE TABLE contacto_emergencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL
);

CREATE TABLE paciente_contacto_emergencia (
    id SERIAL PRIMARY KEY,
    paciente_dni VARCHAR(20) NOT NULL,
    contacto_emergencia_id INT NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    FOREIGN KEY (paciente_dni) REFERENCES paciente(dni) ON DELETE CASCADE,
    FOREIGN KEY (contacto_emergencia_id) REFERENCES contacto_emergencia(id) ON DELETE CASCADE
);

CREATE INDEX idx_pce_paciente_dni ON paciente_contacto_emergencia(paciente_dni);
CREATE INDEX idx_pce_contacto_id ON paciente_contacto_emergencia(contacto_emergencia_id);

CREATE TABLE telefono (
    id SERIAL PRIMARY KEY,
    paciente_dni VARCHAR(20),
    contacto_emergencia_id INT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (paciente_dni) REFERENCES paciente(dni) ON DELETE CASCADE,
    FOREIGN KEY (contacto_emergencia_id) REFERENCES contacto_emergencia(id) ON DELETE CASCADE,
    CHECK (
        paciente_dni IS NOT NULL OR contacto_emergencia_id IS NOT NULL
    )
);

CREATE INDEX idx_telefono_paciente_dni ON telefono(paciente_dni);
CREATE INDEX idx_telefono_contacto_id ON telefono(contacto_emergencia_id);

-- =========================
-- Módulo de Internación
-- =========================

CREATE TABLE habitacion (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL,
    piso INT NOT NULL,
    estado VARCHAR(50) NOT NULL
);

CREATE TABLE internacion (
    id SERIAL PRIMARY KEY,
    paciente_dni VARCHAR(20) NOT NULL,
    habitacion_id INT NOT NULL,
    fecha_ingreso TIMESTAMP NOT NULL,
    fecha_egreso TIMESTAMP,
    traslados_internos INT DEFAULT 0,
    FOREIGN KEY (paciente_dni) REFERENCES paciente(dni),
    FOREIGN KEY (habitacion_id) REFERENCES habitacion(id)
);

CREATE INDEX idx_internacion_paciente_dni ON internacion(paciente_dni);
CREATE INDEX idx_internacion_habitacion_id ON internacion(habitacion_id);

-- =========================
-- Módulo Clínico
-- =========================

CREATE TABLE historial_medico (
    id SERIAL PRIMARY KEY,
    paciente_dni VARCHAR(20) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    FOREIGN KEY (paciente_dni) REFERENCES paciente(dni) ON DELETE CASCADE
);

CREATE INDEX idx_historial_paciente_dni ON historial_medico(paciente_dni);

CREATE TABLE tipo_procedimiento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

CREATE TABLE registro_clinico (
    id SERIAL PRIMARY KEY,
    historial_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_procedimiento_id INT NOT NULL,
    diagnostico TEXT,
    fecha TIMESTAMP NOT NULL,
    FOREIGN KEY (historial_id) REFERENCES historial_medico(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (tipo_procedimiento_id) REFERENCES tipo_procedimiento(id)
);

CREATE INDEX idx_registro_historial_id ON registro_clinico(historial_id);
CREATE INDEX idx_registro_usuario_id ON registro_clinico(usuario_id);
CREATE INDEX idx_registro_tipo_proc_id ON registro_clinico(tipo_procedimiento_id);

CREATE TABLE medicacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

CREATE TABLE suministro_medicacion (
    id SERIAL PRIMARY KEY,
    registro_clinico_id INT NOT NULL,
    medicacion_id INT NOT NULL,
    dosis VARCHAR(50) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    FOREIGN KEY (registro_clinico_id) REFERENCES registro_clinico(id) ON DELETE CASCADE,
    FOREIGN KEY (medicacion_id) REFERENCES medicacion(id)
);

CREATE INDEX idx_suministro_registro_id ON suministro_medicacion(registro_clinico_id);
CREATE INDEX idx_suministro_medicacion_id ON suministro_medicacion(medicacion_id);