-- ============================================================
-- MIGRACIÓN: Autenticación, Invitaciones y Rol ADMINISTRADOR
-- Ejecutar sobre una base de datos que ya tiene el schema.sql
-- y opcionalmente el seed.sql aplicados.
-- ============================================================
-- Este script es IDEMPOTENTE: puede ejecutarse múltiples veces
-- sin producir duplicados ni errores.
-- ============================================================

-- ============================================================
-- 1. ROLES: Insertar roles del sistema si no existen
-- ============================================================

INSERT INTO rol (nombre_rol)
SELECT 'ADMINISTRADOR' WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre_rol = 'ADMINISTRADOR'
);

INSERT INTO rol (nombre_rol)
SELECT 'ADMINISTRATIVO' WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre_rol = 'ADMINISTRATIVO'
);

INSERT INTO rol (nombre_rol)
SELECT 'MEDICO' WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre_rol = 'MEDICO'
);

INSERT INTO rol (nombre_rol)
SELECT 'ENFERMERO' WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre_rol = 'ENFERMERO'
);

-- ============================================================
-- 2. TABLA: invitacion_registro
-- ============================================================

CREATE TABLE IF NOT EXISTS invitacion_registro (
    id_invitacion      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email              VARCHAR(200) NOT NULL,
    -- NOTA ACADÉMICA: se almacena el token en texto plano por simplicidad.
    -- En producción se debería almacenar únicamente token_hash = sha256(token).
    token              VARCHAR(255) NOT NULL,
    id_rol             INT NOT NULL,
    id_usuario_creador INT NOT NULL,
    fecha_creacion     TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_expiracion   TIMESTAMP NOT NULL,
    fecha_uso          TIMESTAMP NULL,
    deleted_at         TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT fk_invitacion_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    CONSTRAINT fk_invitacion_creador
        FOREIGN KEY (id_usuario_creador) REFERENCES usuario(id_usuario),
    CONSTRAINT uq_invitacion_token
        UNIQUE (token),
    CONSTRAINT ck_invitacion_email_formato
        CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

-- ============================================================
-- 3. USUARIO ADMINISTRADOR INICIAL
-- Datos: Admin Clinicks / admin@clinicks.com
-- Password temporal: Admin123456
-- Hash BCrypt verificado (cost 10): $2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K
-- ============================================================

DO $$
DECLARE
    v_id_persona INT;
    v_id_rol     INT;
BEGIN
    -- Obtener el id del rol ADMINISTRADOR
    SELECT id_rol INTO v_id_rol FROM rol WHERE nombre_rol = 'ADMINISTRADOR';

    IF NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'admin@clinicks.com') THEN

        -- Crear persona asociada
        INSERT INTO persona (nombre_persona, apellido_persona, fecha_nacimiento)
        VALUES ('Admin', 'Clinicks', '1990-01-01 00:00:00')
        RETURNING id_persona INTO v_id_persona;

        -- Crear usuario admin
        -- Password temporal: Admin123456
        INSERT INTO usuario (email, pass, autorizacion, id_rol, id_persona, deleted_at)
        VALUES (
            'admin@clinicks.com',
            '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K',
            'ACTIVO',
            v_id_rol,
            v_id_persona,
            NULL
        );

        RAISE NOTICE 'Usuario admin@clinicks.com creado correctamente.';

    ELSE

        -- Si el usuario ya existe: asegurar pass, autorizacion, deleted_at y rol correctos
        -- Password temporal: Admin123456
        UPDATE usuario
        SET
            pass         = '$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K',
            autorizacion = 'ACTIVO',
            deleted_at   = NULL,
            id_rol       = v_id_rol
        WHERE email = 'admin@clinicks.com';

        RAISE NOTICE 'Usuario admin@clinicks.com ya existía. Pass, autorizacion, rol y deleted_at actualizados.';

    END IF;
END $$;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT
    u.id_usuario,
    u.email,
    u.autorizacion,
    r.nombre_rol,
    p.nombre_persona || ' ' || p.apellido_persona AS nombre_completo,
    u.deleted_at
FROM usuario u
JOIN rol r ON r.id_rol = u.id_rol
JOIN persona p ON p.id_persona = u.id_persona
WHERE u.email = 'admin@clinicks.com';
