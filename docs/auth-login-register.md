# Autenticación, Registro por Invitación y Administración de Usuarios

## Roles del sistema

| Rol           | Descripción                                               |
|---------------|-----------------------------------------------------------|
| ADMINISTRADOR | Acceso completo. Panel admin, invitaciones, usuarios.     |
| ADMINISTRATIVO| Módulos administrativos del hospital.                     |
| MEDICO        | Módulos clínicos y acceso a historiales médicos.          |
| ENFERMERO     | Módulos de enfermería.                                    |

---

## Inicialización de la base de datos

La base de datos se inicializa con dos scripts en orden:

```
database/schema.sql      → crea todas las tablas, constraints, índices y triggers
database/seed.sql        → carga datos iniciales (roles, usuarios, datos de prueba)
```

Para un reset completo desde cero (limpia todo y recarga):

```
database/reset_and_seed.sql   → TRUNCATE + seed completo en un solo script
```

> No existe ninguna migración suelta que deba ejecutarse por separado.
> Los archivos `migration_auth.sql` y `migration_admin_rules.sql` fueron consolidados
> en los scripts principales y eliminados del repositorio.

### Pasos desde cero

```bash
# Opción A — psql CLI
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/schema.sql
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/seed.sql

# Opción B — reset completo (equivale a schema + seed sobre base vacía)
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/reset_and_seed.sql

# Opción C — Supabase SQL Editor
# Pegar y ejecutar schema.sql, luego seed.sql (o directamente reset_and_seed.sql).
```

---

## Administrador inicial

| Campo              | Valor                                                               |
|--------------------|---------------------------------------------------------------------|
| Email              | `admin@clinicks.com`                                                |
| Contraseña         | `Admin123456`                                                       |
| Rol                | `ADMINISTRADOR`                                                     |
| autorizacion       | `ACTIVO`                                                            |
| must_change_password | `FALSE`                                                           |
| Hash BCrypt (cost 10) | `$2a$10$GrSosoIMBYHEFVBQUQMEQ.tcaITI44c.eEUHY.Pvrps0WRHwW0T2K` |

`admin@clinicks.com` es el **superadmin protegido** del sistema. Ver reglas más abajo.

### Usuarios de prueba (seed)

| Email                  | Contraseña inicial | Rol            | must_change_password |
|------------------------|--------------------|----------------|----------------------|
| `admin@clinicks.com`   | Admin123456        | ADMINISTRADOR  | FALSE                |
| `admin@hospital.com`   | administrativo     | ADMINISTRATIVO | TRUE                 |
| `claudia@hospital.com` | Admin123456        | MEDICO         | TRUE                 |
| `enfermera@hospital.com` | Enfermera123        | ENFERMERO      | TRUE                 |

Los usuarios de prueba tienen `must_change_password=TRUE` y deben cambiar su contraseña en el primer login.

---

## Flujo de Login

1. El usuario ingresa email y contraseña en `/login`.
2. El frontend llama a `POST /api/auth/login`.
3. El backend valida:
   - Que el usuario exista y tenga `deleted_at IS NULL`.
   - Que la contraseña coincida con el hash BCrypt almacenado en `usuario.pass`.
4. Si es válido, genera un JWT firmado con HS256 (24h de expiración) y devuelve:

   ```json
   {
     "token": "eyJ...",
     "usuario": {
       "idUsuario": 1,
       "email": "admin@clinicks.com",
       "nombre": "Admin",
       "apellido": "Clinicks",
       "nombreCompleto": "Admin Clinicks",
       "iniciales": "AC",
       "rol": "ADMINISTRADOR",
       "autorizacion": "ACTIVO"
     }
   }
   ```

5. El frontend guarda el token en `localStorage` (`clinicks_token`) y redirige según el rol:
   - `ADMINISTRADOR` → `/admin`
   - Resto → `/` (pacientes)

---

## Flujo de Registro por Invitación

El registro es **solo por invitación**. No existe un registro público.

### 1. El ADMINISTRADOR crea una invitación

```http
POST /api/auth/invitations
Authorization: Bearer <token>

{
  "email": "medico@clinicks.com",
  "rol": "MEDICO",
  "fechaExpiracion": "2026-06-01T23:59:00"  // opcional, default 7 días
}
```

Respuesta:

```json
{
  "email": "medico@clinicks.com",
  "rol": "MEDICO",
  "invitationLink": "http://localhost:5173/register?token=uuid-token",
  "fechaCreacion": "...",
  "fechaExpiracion": "...",
  "fechaUso": null,
  "usada": false,
  "vencida": false
}
```

### 2. El invitado accede al link

Navega a `/register?token=uuid-token`.
El frontend valida el token contra `GET /api/auth/invitations/validate?token=...` y muestra el email y rol asignados.

### 3. El invitado completa el formulario

Completa nombre, apellido, fecha de nacimiento y contraseña.

```http
POST /api/auth/register

{
  "token": "uuid-token",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1995-05-10",
  "password": "Password123"
}
```

El backend:

- Valida que el token exista, no esté vencido, no esté usado y no esté cancelado.
- Valida que no exista ya un usuario con ese email.
- Crea una `persona` con los datos personales.
- Crea un `usuario` con email de la invitación, pass hasheada BCrypt, `autorizacion='ACTIVO'`, `deleted_at=NULL`.
- Marca `invitacion_registro.fecha_uso = NOW()`.

---

## Endpoints

### Públicos

| Método | Endpoint                              | Descripción                       |
|--------|---------------------------------------|-----------------------------------|
| POST   | `/api/auth/login`                     | Login con email/password          |
| POST   | `/api/auth/register`                  | Registro con token de invitación  |
| GET    | `/api/auth/invitations/validate`      | Previsualizar invitación por token|

### Autenticados (cualquier rol)

| Método | Endpoint        | Descripción              |
|--------|-----------------|--------------------------|
| GET    | `/api/auth/me`  | Datos del usuario actual |

### Solo ADMINISTRADOR

| Método | Endpoint                                | Descripción                        |
|--------|-----------------------------------------|------------------------------------|
| POST   | `/api/auth/invitations`                 | Crear invitación (no ADMINISTRADOR)|
| GET    | `/api/auth/invitations`                 | Listar invitaciones                |
| GET    | `/api/admin/users`                      | Listar usuarios                    |
| PATCH  | `/api/admin/users/{id}/role`            | Cambiar rol (no ADMINISTRADOR)     |
| PATCH  | `/api/admin/users/{id}/disable`         | Desactivar usuario                 |
| PATCH  | `/api/admin/users/{id}/enable`          | Activar usuario                    |
| PATCH  | `/api/admin/users/{id}/reset-password`  | Resetear contraseña a temporal     |

### Autenticados (cualquier rol) — Perfil

| Método | Endpoint                  | Descripción                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/profile`            | Obtener datos del perfil propio    |
| PATCH  | `/api/profile/password`   | Cambiar contraseña propia          |
| PATCH  | `/api/profile/email`      | Cambiar email propio               |
| PATCH  | `/api/profile/basic-data` | Cambiar nombre/apellido propios    |

---

## Reglas del administrador principal (`admin@clinicks.com`)

El usuario `admin@clinicks.com` es el **superadmin protegido**. Las siguientes operaciones están bloqueadas tanto en frontend como en backend:

- No se puede cambiar su rol desde el panel de admin.
- No se puede desactivarlo.
- No se puede resetear su contraseña desde el panel de admin.
- No puede cambiar su propio email ni contraseña desde el perfil.
- No se puede invitar a nadie con rol `ADMINISTRADOR`.
- No se puede asignar rol `ADMINISTRADOR` a ningún otro usuario.

Estas reglas están implementadas en `AdminServiceImpl` y `AdminController`, utilizando la constante `AdminConstants.EMAIL_ADMIN_PROTEGIDO = "admin@clinicks.com"`.

### Columna `must_change_password`

La tabla `usuario` incluye la columna `must_change_password BOOLEAN NOT NULL DEFAULT FALSE`.

Cuando un ADMINISTRADOR resetea la contraseña de un usuario:

- La contraseña se cambia a `Temporal123456`.
- Se activa el flag `must_change_password = true` en la base de datos.
- Al iniciar sesión, el frontend detecta este flag y muestra el modal de cambio de contraseña.
- Al completar el cambio, `must_change_password` vuelve a `false`.

---

## Cómo probar el sistema desde cero

### 1. Inicializar la base de datos

```bash
# Opción A: schema + seed por separado
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/schema.sql
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/seed.sql

# Opción B: reset completo
psql "postgresql://<user>:<pass>@<host>/<db>" -f database/reset_and_seed.sql
```

O desde el SQL Editor de Supabase: pegar y ejecutar `reset_and_seed.sql`.

### 2. Iniciar el backend

```bash
cd backend
./mvnw spring-boot:run
```

### 3. Iniciar el frontend

```bash
cd frontend
npm install   # primera vez o luego de cambiar package.json
npm run dev
```

### 4. Login con el admin inicial

Abrir `http://localhost:5173/login`

- Email: `admin@clinicks.com`
- Password: `Admin123456`

El sistema redirige automáticamente a `/admin`.

### 5. Crear una invitación

En `/admin` → pestaña **Invitaciones** → completar email y rol → clic en **Crear invitación**.
Se genera el link. Copiarlo con el botón 📋.

### 6. Registrar un usuario nuevo

Abrir el link: `http://localhost:5173/register?token=...`

Completar nombre, apellido, fecha de nacimiento y contraseña → **Crear cuenta**.
Redirige a `/login`.

### 7. Login con el usuario nuevo

Iniciar sesión con el email de la invitación y la contraseña recién creada.

### 8. Verificar restricciones por rol

- Un usuario `MEDICO` o `ENFERMERO` que intenta acceder a `/admin` es redirigido por `ProtectedRoute`.
- El backend rechaza con `403` cualquier llamada a `/api/admin/**` sin rol `ADMINISTRADOR`.
- El registro sin token válido devuelve `400`.

---

## Variables de entorno requeridas

### Backend (`backend/.env`)

```env
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=f91771f46ff97c32387daef82dab97dc7dd6d9e08f3e06b29603af3452cd020d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Arquitectura de seguridad

```
Request
  └─ JwtAuthFilter (extrae y valida JWT, puebla SecurityContext)
       └─ SecurityConfig (evalúa reglas: permitAll / hasAuthority)
            └─ Controller → Service → Repository
```

- **Sin token**: solo `/api/auth/login`, `/api/auth/register`, `/api/auth/invitations/validate` son accesibles.
- **Con token**: el filtro extrae el email y el rol, los pone en el `SecurityContext`.
- **`/api/admin/**`**: requiere rol `ADMINISTRADOR` (evaluado por Spring Security).
- **Nunca se devuelve `usuario.pass`** en ningún DTO de respuesta.

---

## Notas sobre el token de invitación

El token se almacena en **texto plano** en la tabla `invitacion_registro` por simplicidad académica.
En un entorno de producción, se debería almacenar solo el `sha256(token)` y comparar el hash.
