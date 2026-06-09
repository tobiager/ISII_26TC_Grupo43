<p align="center">
    <img src="./assets/clinicks.png" alt="Clinicks Banner" width="1500"/>
</p>

# Clinicks - Sistema de Gestión Hospitalaria

**Clinicks** es una plataforma integral de gestión hospitalaria diseñada para optimizar la operativa diaria en centros de salud. El sistema permite la centralización de historiales clínicos, el seguimiento de pacientes en tiempo real y la gestión eficiente de recursos hospitalarios, garantizando la trazabilidad de la información médica.

## Características Principales

* **Gestión de Pacientes:** Registro completo, edición y baja lógica de pacientes con ficha médica, obra social, domicilio y contactos de emergencia.
* **Historial Clínico Digital:** Registro cronológico de consultas, diagnósticos y procedimientos, con timeline por paciente y soporte para tipos de procedimiento personalizados.
* **Gestión de Hospitalización:** Mapa de habitaciones por piso con estados (disponible / ocupada / mantenimiento), internación, traslado y egreso desde el panel.
* **Seguridad y Roles:** Autenticación JWT, registro por invitación y control de acceso por rol (Administrador, Médico, Enfermero, Administrativo).
* **Panel de Administración:** Gestión de usuarios activos, cambio de rol, activar/desactivar cuentas y generación de invitaciones de registro.
* **Perfil de Usuario:** Cambio de contraseña y email con verificación de credenciales; flag de cambio obligatorio de contraseña en primer login.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | Java 17 + Spring Boot 3.2.5 |
| Base de datos | PostgreSQL (Supabase en producción) |
| Seguridad | Spring Security + JWT (JJWT 0.12.3) |
| Despliegue | Vercel (Frontend) + Supabase (Backend/DB) |

---

## Estructura del Proyecto

```
ISII_26TC_Grupo43/
├── backend/               # API REST con Spring Boot
│   ├── src/
│   └── .env               # Variables de entorno del backend
├── frontend/              # SPA con React + TypeScript
│   ├── src/
│   └── .env               # Variables de entorno del frontend
├── database/
│   ├── schema.sql         # DDL completo del esquema
│   ├── seed.sql           # Datos de prueba (50 pacientes, 4 usuarios, habitaciones)
│   └── reset_and_seed.sql # TRUNCATE + seed en un solo script
└── docs/
    ├── ISII_26TC_Grupo43.pdf   # Documentación del proyecto
    └── Diccionario de Datos.pdf
```

---

## Ejecución Local

### Prerrequisitos

* **Java 17** o superior
* **Maven 3.8+**
* **Node.js 18+** y **npm**
* **PostgreSQL** (local) o acceso a una instancia Supabase

### 1 — Clonar el repositorio

```bash
git clone https://github.com/tobiager/ISII_26TC_Grupo43.git
cd ISII_26TC_Grupo43
```

### 2 — Preparar la base de datos

Ejecutar los scripts en orden sobre una base de datos PostgreSQL vacía:

```sql
-- En psql o cualquier cliente SQL:
\i database/schema.sql
\i database/seed.sql
```

> Si la base ya tiene datos y querés resetear todo: `\i database/reset_and_seed.sql`

### 3 — Configurar el backend

Crear el archivo `backend/.env` con las siguientes variables:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/clinicks
DATABASE_USERNAME=tu_usuario_postgres
DATABASE_PASSWORD=tu_contraseña_postgres

JWT_SECRET=f91771f46ff97c32387daef82dab97dc7dd6d9e08f3e06b29603af3452cd020d

FRONTEND_URL=http://localhost:5173
```

Luego iniciar el backend:

```bash
cd backend
mvn spring-boot:run
```

El servidor queda escuchando en `http://localhost:8080`.

### 4 — Configurar el frontend

Crear el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Luego instalar dependencias e iniciar:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## Usuarios de Prueba

Todos los usuarios del seed tienen la misma contraseña: **`Admin123456`**

| Email | Rol | Notas |
|---|---|---|
| `admin@clinicks.com` | Administrador | Superadmin protegido — no se puede desactivar, cambiar rol ni resetear contraseña |
| `admin@hospital.com` | Administrativo | Debe cambiar contraseña en el primer login |
| `claudia@hospital.com` | Médico | Debe cambiar contraseña en el primer login |
| `enfermera@hospital.com` | Enfermero | Debe cambiar contraseña en el primer login |

## Roles y Permisos

| Permiso | Administrador | Médico | Enfermero | Administrativo |
|---|:---:|:---:|:---:|:---:|
| Ver pacientes | ✓ | ✓ | ✓ | ✓ |
| Registrar / editar pacientes | ✓ | — | — | — |
| Dar de baja pacientes | ✓ | — | — | — |
| Ver habitaciones | ✓ | ✓ (solo lectura) | ✓ | ✓ (solo lectura) |
| Internar / trasladar / egresar | ✓ | — | ✓ | — |
| Cambiar estado habitación | ✓ | — | ✓ | — |
| Ver historial clínico | ✓ | ✓ | ✓ | ✓ |
| Registrar eventos en historial | ✓ | ✓ | ✓ | — |
| Acceder al panel de administración | ✓ | — | — | — |

---

## Rutas del Frontend

| Ruta | Descripción | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Público |
| `/register?token=...` | Registro por invitación | Público (requiere token válido) |
| `/` | Redirección al panel principal | Autenticado |
| `/pacientes` | Panel médico — listado y gestión de pacientes | Todos los roles |
| `/habitaciones` | Mapa de habitaciones por piso | Todos los roles |
| `/historial` | Listado de historiales clínicos | Todos los roles |
| `/admin` | Panel de administración de usuarios | Solo Administrador |

---

## Datos de Prueba del Seed

El script `seed.sql` carga el siguiente conjunto de datos:

* **50 pacientes** distribuidos en las 24 provincias argentinas, con ficha médica, obra social, domicilio, contactos de emergencia y teléfonos
* **10 obras sociales** (OSDE, Swiss Medical, Galeno, PAMI, IOMA, entre otras)
* **22 pacientes con historial de internaciones** (5 con internación activa al momento del seed)
* **40 habitaciones** distribuidas en 7 pisos (4 en mantenimiento, las ocupadas según internaciones activas)
* **+500 registros clínicos** por paciente con historiales cortos, medios y extensos
* **17 tipos de procedimiento** incluyendo Internación, Traslado y Alta médica (generados automáticamente por el sistema)
* **12 alergias**, **10 enfermedades crónicas** y **8 tipos de antecedente familiar** para fichas médicas

---

## Tests

El proyecto incluye tests de integración para el backend. Para ejecutarlos:

```bash
cd backend
mvn test
```

Los tests cubren validaciones del schema de pacientes (tipo de sangre, teléfono, tipo de residencia) y el controlador de pacientes.

---

## Documentación del Proyecto

Los detalles técnicos están en la carpeta `/docs`:

* **ISII_26TC_Grupo43.pdf** — Documentación completa del proyecto
* **Diccionario de Datos.pdf** — Detalle de cada tabla, columna y restricción del esquema

---

> [!NOTE]
> Este proyecto fue desarrollado como Trabajo de Campo para la cátedra de **Ingeniería de Software 2 (2026)** en la Licenciatura en Sistemas de Información - **UNNE**.

**Grupo Nº 43** Integrantes: *Zini, Samuel Nehuen* & *Orban, Tobias Naim*
