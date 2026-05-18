# Guia de estructura del proyecto Clinicks

## 1. Objetivo de esta guia

Este documento explica como esta organizado el proyecto para alguien que recien empieza.

La guia se centra en:

1. Entender las 3 capas del sistema: frontend, backend y base de datos PostgreSQL.
2. Ver como se conectan entre si.
3. Ubicar los archivos y metodos principales de las funcionalidades actuales: pacientes, habitaciones, historial clinico y administracion de usuarios.

---

## 2. Que resuelve este proyecto

Clinicks es un sistema de gestion hospitalaria. En el estado actual permite trabajar con:

1. Gestion de pacientes.
2. Gestion de habitaciones e internaciones.
3. Historial clinico por paciente.
4. Administracion de usuarios, roles e invitaciones.
5. Inicio de sesion y actualizacion del perfil.

---

## 3. Arquitectura general

La aplicacion sigue una arquitectura por capas:

1. Capa Frontend: React + TypeScript + Tailwind.
2. Capa Backend: Spring Boot + JPA/Hibernate.
3. Capa de Datos: PostgreSQL.

Flujo general de una accion:

1. El usuario realiza una accion en pantalla.
2. El frontend valida y envia una peticion HTTP a la API.
3. El backend recibe la peticion, valida reglas de negocio y consulta o guarda datos.
4. PostgreSQL persiste la informacion.
5. El backend devuelve un DTO de respuesta.
6. El frontend actualiza la interfaz.

---

## 4. Estructura general del repositorio

### 4.1 Raiz

- `frontend/`: aplicacion web.
- `backend/`: API REST y logica de negocio.
- `database/`: scripts SQL de esquema y datos.
- `docs/`: documentacion del proyecto.

### 4.2 Frontend

- `frontend/src/pages/PatientsPage.tsx`: pagina principal de pacientes.
- `frontend/src/pages/HabitacionesPage.tsx`: mapa de habitaciones e internaciones.
- `frontend/src/pages/HistorialPage.tsx`: listado de historial medico por paciente.
- `frontend/src/pages/AdminPage.tsx`: gestion de usuarios e invitaciones.
- `frontend/src/components/`: componentes visuales reutilizables.
- `frontend/src/services/`: llamadas HTTP al backend.
- `frontend/src/types/`: tipos TypeScript.
- `frontend/src/utils/permissions.ts`: reglas de permisos por rol.
- `frontend/src/validations/`: validaciones de formularios.

### 4.3 Backend

- `backend/src/main/java/com/clinicks/controller/`: endpoints REST.
- `backend/src/main/java/com/clinicks/service/`: interfaces de servicio.
- `backend/src/main/java/com/clinicks/service/impl/`: logica de negocio concreta.
- `backend/src/main/java/com/clinicks/repository/`: acceso a datos con Spring Data JPA.
- `backend/src/main/java/com/clinicks/model/`: entidades JPA.
- `backend/src/main/java/com/clinicks/dto/`: contratos de entrada y salida.
- `backend/src/main/java/com/clinicks/exception/`: manejo de errores.
- `backend/src/main/resources/application.yml`: configuracion del backend.

### 4.4 Datos

- `database/schema.sql`: estructura de tablas y relaciones.
- `database/seed.sql`: datos iniciales.
- `database/reset_and_seed.sql`: reinicia y vuelve a cargar todo.

---

## 5. Tecnologias usadas

### 5.1 Frontend

1. React: construye la interfaz por componentes.
2. TypeScript: agrega tipos para reducir errores.
3. Tailwind CSS: estilos rapidos con clases utilitarias.
4. Axios: cliente HTTP para consumir la API.
5. Vite: servidor de desarrollo y build rapido.

### 5.2 Backend

1. Spring Boot: framework para crear APIs REST en Java.
2. Spring Web: controladores y rutas HTTP.
3. Spring Data JPA: repositorios y persistencia.
4. Hibernate: traduce objetos a SQL.
5. Bean Validation: validaciones declarativas.
6. Lombok: reduce codigo repetitivo.

### 5.3 Base de datos

1. PostgreSQL: motor relacional.
2. SQL scripts: definen esquema y datos de prueba.

### 5.4 Herramientas de ejecucion

1. Node.js + npm: para el frontend.
2. Maven: para el backend.
3. Java 17: runtime requerido por Spring Boot.

---

## 6. Como se conectan frontend, backend y datos

Caso de ejemplo: registrar un paciente.

1. La UI toma los datos del formulario en `PatientForm.tsx`.
2. El servicio `patientService.create()` envia un POST a `/api/pacientes`.
3. El controlador `PacienteController` recibe el `PacienteRequestDTO`.
4. `PacienteServiceImpl` valida DNI, afiliacion y relaciones asociadas.
5. JPA persiste la informacion en PostgreSQL.
6. El backend responde con un `PacienteResponseDTO`.
7. El frontend muestra un mensaje de exito y recarga el listado.

---

## 7. Autenticacion, perfil y permisos

### 7.1 Inicio de sesion e invitaciones

El frontend usa `frontend/src/services/authService.ts` para:

1. Iniciar sesion con `/auth/login`.
2. Registrarse con `/auth/register` usando un token de invitacion.
3. Validar tokens de invitacion con `/auth/invitations/validate`.
4. Crear y listar invitaciones desde `/auth/invitations`.

### 7.2 Perfil de usuario

El perfil actual se obtiene desde `/api/profile` y se puede actualizar con:

1. `PATCH /api/profile/email`
2. `PATCH /api/profile/password`
3. `PATCH /api/profile/basic-data`

### 7.3 Permisos por rol

Las reglas principales estan en `frontend/src/utils/permissions.ts`:

1. Pacientes: administradores y administrativos pueden editar o dar de baja.
2. Habitaciones: administradores y enfermeros pueden internar, trasladar, egresar y cambiar estado.
3. Historial: administradores, medicos y enfermeros pueden registrar eventos clinicos.
4. Administracion: solo administradores pueden entrar al panel de admin.

---

## 8. Capa Frontend: modulos principales

### 8.1 Pacientes

Archivo principal: `frontend/src/pages/PatientsPage.tsx`

Responsabilidades:

1. Cargar pacientes activos.
2. Filtrar por nombre, DNI, obra social y estado.
3. Abrir formulario de alta o edicion.
4. Abrir detalle del paciente.
5. Dar de baja logica y restaurar pacientes.
6. Mostrar pacientes desactivados.

Servicios que usa: `frontend/src/services/patientService.ts`.

Metodos clave del servicio:

1. `getAll()` -> `GET /pacientes`
2. `getDeleted()` -> `GET /pacientes/desactivados`
3. `getById(id)` -> `GET /pacientes/{id}`
4. `create(data)` -> `POST /pacientes`
5. `update(id, data)` -> `PUT /pacientes/{id}`
6. `delete(id)` -> `DELETE /pacientes/{id}`
7. `restaurar(id)` -> `PATCH /pacientes/{id}/restaurar`
8. `checkDni(...)` -> valida unicidad de DNI.
9. `checkAfiliado(...)` -> valida afiliacion por obra social.

El formulario de pacientes valida datos con `frontend/src/validations/patientSchema.ts` y reutiliza componentes como `PatientForm.tsx`, `PatientTable.tsx` y `PatientDetailModal.tsx`.

### 8.2 Habitaciones e internaciones

Archivo principal: `frontend/src/pages/HabitacionesPage.tsx`

Responsabilidades:

1. Listar habitaciones agrupadas por piso.
2. Mostrar estado de cada habitacion: disponible, ocupada o mantenimiento.
3. Internar pacientes.
4. Trasladar pacientes entre habitaciones.
5. Dar el egreso de una internacion.
6. Cambiar el estado de una habitacion cuando esta libre.

Servicio que usa: `frontend/src/services/roomService.ts`.

Metodos clave del servicio:

1. `getAll()` -> `GET /habitaciones`
2. `internar(...)` -> `POST /habitaciones/{id}/internar`
3. `trasladar(...)` -> `POST /internaciones/{id}/trasladar`
4. `egresar(...)` -> `POST /internaciones/{id}/egresar`
5. `cambiarEstado(...)` -> `PATCH /habitaciones/{id}/estado`

### 8.3 Historial medico

Archivo principal: `frontend/src/pages/HistorialPage.tsx`

Responsabilidades:

1. Listar pacientes para consultar su historial.
2. Filtrar por nombre, apellido o DNI.
3. Abrir el detalle del historial medico.
4. Ver eventos ambulatorios e internaciones.

Servicio que usa: `frontend/src/services/historialService.ts`.

Metodos clave del servicio:

1. `getByPaciente(idPaciente)` -> `GET /historial/{idPaciente}`
2. `getTiposProcedimiento()` -> `GET /historial/tipos-procedimiento`
3. `registrarEvento(...)` -> `POST /historial/{idPaciente}/registros`

### 8.4 Administracion

Archivo principal: `frontend/src/pages/AdminPage.tsx`

Responsabilidades:

1. Listar usuarios del sistema.
2. Cambiar roles.
3. Activar o desactivar usuarios.
4. Resetear contraseñas.
5. Crear invitaciones con vencimiento opcional.
6. Copiar el link de invitacion.

Servicio que usa: `frontend/src/services/authService.ts`.

Metodos relevantes:

1. `listarUsuarios()` -> `GET /admin/users`
2. `cambiarRol(...)` -> `PATCH /admin/users/{id}/role`
3. `desactivarUsuario(...)` -> `PATCH /admin/users/{id}/disable`
4. `activarUsuario(...)` -> `PATCH /admin/users/{id}/enable`
5. `resetearPassword(...)` -> `PATCH /admin/users/{id}/reset-password`
6. `crearInvitacion(...)` -> `POST /auth/invitations`
7. `listarInvitaciones()` -> `GET /auth/invitations`

---

## 9. Capa Backend: controladores y servicios principales

### 9.1 Pacientes

El controlador de pacientes expone las operaciones de listado, detalle, alta, edicion, baja, restauracion y validacion de duplicados.

El servicio `PacienteServiceImpl` concentra la logica de negocio de alta y edicion, incluida la creacion o reutilizacion de relaciones como obra social, afiliacion, telefonos, contactos de emergencia y ficha medica.

### 9.2 Habitaciones

`HabitacionController` expone:

1. `GET /api/habitaciones`
2. `POST /api/habitaciones/{id}/internar`
3. `POST /api/internaciones/{id}/trasladar`
4. `POST /api/internaciones/{id}/egresar`
5. `PATCH /api/habitaciones/{id}/estado`

`HabitacionServiceImpl` se encarga de:

1. Listar habitaciones con su estado actual.
2. Internar pacientes en habitaciones disponibles.
3. Trasladar internaciones abiertas a otra habitacion disponible.
4. Egresar internaciones.
5. Registrar automaticamente eventos clinicos en el historial.

### 9.3 Historial medico

`HistorialController` expone:

1. `GET /api/historial/tipos-procedimiento`
2. `GET /api/historial/{idPaciente}`
3. `POST /api/historial/{idPaciente}/registros`

`HistorialServiceImpl` hace dos cosas principales:

1. Arma el historial completo de un paciente separando registros, eventos ambulatorios e internaciones.
2. Guarda nuevos eventos clinicos asociados al paciente, al tipo de procedimiento y al usuario que los registro.

### 9.4 Administracion de usuarios

`AdminController` expone:

1. `GET /api/admin/users`
2. `PATCH /api/admin/users/{id}/role`
3. `PATCH /api/admin/users/{id}/disable`
4. `PATCH /api/admin/users/{id}/enable`
5. `PATCH /api/admin/users/{id}/reset-password`

`AdminServiceImpl` aplica restricciones importantes:

1. Protege al administrador principal.
2. No permite asignar el rol `ADMINISTRADOR` desde el panel.
3. Marca usuarios como inactivos con `deletedAt`.
4. Genera contraseñas temporales y obliga a cambiarlas en el proximo ingreso.

### 9.5 Perfil y autenticacion

`AuthController` cubre login, registro, validacion de invitaciones y operaciones de admin sobre invitaciones.

`PerfilController` expone la consulta y edicion del perfil en `/api/profile`.

---

## 10. Modelo de datos relevante

La base esta definida en `database/schema.sql`.

Tablas importantes para entender el sistema:

1. `paciente`, `persona`, `residencia`, `domicilio`, `localidad`, `provincia`.
2. `ficha_medica` y sus relaciones con `alergia`, `enfermedad_cronica` y `antecedente_familiar`.
3. `obra_social` y `afiliacion_obra_social`.
4. `telefono` y `contacto_emergencia`.
5. `historial_medico`, `registro_clinico`, `tipo_procedimiento`.
6. `habitacion_internacion` e `internacion`.
7. `usuario`, `rol`, `invitacion`.

Relaciones principales:

1. Paciente -> Persona.
2. Paciente -> Residencia.
3. Paciente -> FichaMedica.
4. Paciente -> AfiliacionObraSocial.
5. FichaMedica -> Alergia / EnfermedadCronica / AntecedenteFamiliar.
6. Paciente -> Telefono.
7. Paciente -> ContactoEmergencia.
8. HistorialMedico -> RegistroClinico.
9. Internacion -> Habitacion y HistorialMedico.
10. Usuario -> Rol.

---

## 11. Flujo funcional por modulo

### 11.1 Pacientes

1. El usuario abre la pagina de pacientes.
2. El frontend carga el listado activo.
3. Al crear o editar, se validan datos locales y duplicados de negocio.
4. El backend persiste la persona, la residencia, la ficha medica y las relaciones asociadas.
5. El listado se actualiza y la UI muestra el resultado.

### 11.2 Habitaciones

1. El usuario abre el mapa de habitaciones.
2. Ve el estado de cada habitacion y el paciente ocupado, si existe.
3. Puede internar, trasladar o egresar segun su rol.
4. Cada cambio relevante deja un registro en el historial clinico.

### 11.3 Historial medico

1. El usuario abre el historial de un paciente.
2. El backend devuelve registros, eventos ambulatorios e internaciones.
3. Si corresponde, se registran nuevos eventos clinicos con tipo de procedimiento y descripcion.

### 11.4 Administracion

1. El administrador abre el panel de admin.
2. Puede gestionar usuarios e invitaciones.
3. Los cambios de rol, estado y contraseña se aplican desde el backend con validaciones de seguridad.

---

## 12. Configuracion y arranque

1. PostgreSQL debe estar disponible con el esquema y los datos cargados.
2. El backend se configura en `backend/src/main/resources/application.yml`.
3. El frontend consume la API mediante `/api` o la URL que se defina en `VITE_API_URL`.
4. El token de sesion se guarda en `localStorage` y el cliente adjunta `Authorization: Bearer ...` en cada request.

Orden recomendado para levantar el proyecto:

1. Base de datos.
2. Backend.
3. Frontend.

---
