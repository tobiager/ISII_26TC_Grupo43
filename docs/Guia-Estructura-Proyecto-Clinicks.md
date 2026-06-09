# Guía de estructura del proyecto Clinicks

## 1. Para qué sirve esta guía

Esta guía está pensada para alguien que abre el proyecto por primera vez y necesita entender rápido:

1. Qué hace Clinicks.
2. Cómo está dividido el sistema.
3. Qué archivo mirar primero según lo que quiera entender.
4. Cómo viaja una acción desde la pantalla hasta la base de datos.

La idea no es memorizar todos los archivos, sino construir una vista mental clara del proyecto.

---

## 2. Vista general del sistema

Clinicks es un sistema de gestión hospitalaria. Hoy cubre cinco bloques funcionales:

1. Pacientes.
2. Habitaciones e internaciones.
3. Historial clínico.
4. Administración de usuarios, roles e invitaciones.
5. Autenticación y perfil del usuario.

La arquitectura sigue una secuencia simple:

Frontend -> Backend -> Base de datos -> Backend -> Frontend

En términos prácticos:

1. El usuario hace una acción en la interfaz.
2. El frontend valida datos básicos y envía una petición HTTP.
3. El backend recibe la petición, aplica reglas de negocio y coordina la operación.
4. PostgreSQL guarda o devuelve la información.
5. El backend responde con un DTO.
6. El frontend actualiza la pantalla.

---

## 3. Ruta recomendada para un nuevo usuario

Si recién estás entrando al proyecto, este orden suele ser el más útil:

1. Leer [README.md](../README.md) para entender el propósito general.
2. Revisar esta guía para ubicar carpetas y responsabilidades.
3. Abrir [backend/src/main/java/com/clinicks/ClinicsApplication.java](../backend/src/main/java/com/clinicks/ClinicsApplication.java) para ver el punto de arranque.
4. Mirar [backend/src/main/resources/application.yml](../backend/src/main/resources/application.yml) para entender la configuración.
5. Revisar [diagrama-clases.md](diagrama-clases.md) para ver el modelo lógico del dominio.
6. Entrar después a un módulo concreto, por ejemplo pacientes o autenticación.

---

## 4. Estructura del repositorio

### 4.1 Raíz

- [../frontend/](../frontend/): aplicación web.
- [../backend/](../backend/): API REST y reglas de negocio.
- [../database/](../database/): scripts SQL de esquema y datos.
- [../docs/](../docs/): documentación técnica y funcional.

### 4.2 Frontend

- [../frontend/src/pages/](../frontend/src/pages/): pantallas principales.
- [../frontend/src/components/](../frontend/src/components/): componentes reutilizables.
- [../frontend/src/services/](../frontend/src/services/): llamadas HTTP al backend.
- [../frontend/src/types/](../frontend/src/types/): tipos TypeScript.
- [../frontend/src/utils/](../frontend/src/utils/): utilidades de permisos y comportamiento.
- [../frontend/src/validations/](../frontend/src/validations/): validaciones de formularios.
- Si quieres ver el flujo completo del frontend y su comunicación con el backend, revisa [Guia-Frontend-y-Comunicacion-con-Backend.md](Guia-Frontend-y-Comunicacion-con-Backend.md).

### 4.3 Backend

- [../backend/src/main/java/com/clinicks/controller/](../backend/src/main/java/com/clinicks/controller/): entradas HTTP.
- [../backend/src/main/java/com/clinicks/service/](../backend/src/main/java/com/clinicks/service/): contratos de negocio.
- [../backend/src/main/java/com/clinicks/service/impl/](../backend/src/main/java/com/clinicks/service/impl/): implementación real de la lógica.
- [../backend/src/main/java/com/clinicks/repository/](../backend/src/main/java/com/clinicks/repository/): acceso a datos con Spring Data JPA.
- [../backend/src/main/java/com/clinicks/model/](../backend/src/main/java/com/clinicks/model/): entidades JPA.
- [../backend/src/main/java/com/clinicks/dto/](../backend/src/main/java/com/clinicks/dto/): objetos que viajan entre capas.
- [../backend/src/main/java/com/clinicks/exception/](../backend/src/main/java/com/clinicks/exception/): errores de negocio y manejo global.
- [../backend/src/main/java/com/clinicks/security/](../backend/src/main/java/com/clinicks/security/): JWT y control de acceso.
- [../backend/src/main/java/com/clinicks/config/](../backend/src/main/java/com/clinicks/config/): configuración transversal.

### 4.4 Base de datos

- [../database/schema.sql](../database/schema.sql): estructura de tablas.
- [../database/seed.sql](../database/seed.sql): datos iniciales.
- [../database/reset_and_seed.sql](../database/reset_and_seed.sql): reinicia y vuelve a cargar el entorno.

---

## 5. Cómo pensar el backend

El backend está organizado por responsabilidades. No todo está en una sola capa.

### 5.1 Controladores

Son la puerta de entrada HTTP.

Hacen estas tareas:

1. Recibir la petición.
2. Leer parámetros, body o headers.
3. Llamar al servicio correcto.
4. Devolver la respuesta HTTP.

Ejemplos:

- [AuthController.java](../backend/src/main/java/com/clinicks/controller/AuthController.java)
- [PacienteController.java](../backend/src/main/java/com/clinicks/controller/PacienteController.java)
- [HabitacionController.java](../backend/src/main/java/com/clinicks/controller/HabitacionController.java)
- [HistorialController.java](../backend/src/main/java/com/clinicks/controller/HistorialController.java)
- [AdminController.java](../backend/src/main/java/com/clinicks/controller/AdminController.java)
- [PerfilController.java](../backend/src/main/java/com/clinicks/controller/PerfilController.java)

### 5.2 Servicios

Son el corazón del negocio.

Hacen estas tareas:

1. Validar reglas de negocio.
2. Coordinar varias entidades y repositorios.
3. Manejar transacciones.
4. Lanzar errores entendibles cuando algo no se puede hacer.

Implementaciones principales:

- [AuthServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java)
- [PacienteServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java)
- [HabitacionServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java)
- [HistorialServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java)
- [AdminServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java)
- [PerfilServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java)

### 5.3 Repositorios

Son la capa de persistencia.

Hacen estas tareas:

1. Consultar datos.
2. Guardar cambios.
3. Ejecutar búsquedas específicas con JPA o SQL nativo.

Ejemplos importantes:

- [UsuarioRepository.java](../backend/src/main/java/com/clinicks/repository/UsuarioRepository.java)
- [PacienteRepository.java](../backend/src/main/java/com/clinicks/repository/PacienteRepository.java)
- [HistorialMedicoRepository.java](../backend/src/main/java/com/clinicks/repository/HistorialMedicoRepository.java)
- [InternacionRepository.java](../backend/src/main/java/com/clinicks/repository/InternacionRepository.java)
- [RegistroClinicoRepository.java](../backend/src/main/java/com/clinicks/repository/RegistroClinicoRepository.java)
- [InvitacionRegistroRepository.java](../backend/src/main/java/com/clinicks/repository/InvitacionRegistroRepository.java)

### 5.4 Modelos

Son las entidades que representan la base de datos y el dominio clínico.

Ejemplos:

- [Usuario.java](../backend/src/main/java/com/clinicks/model/Usuario.java)
- [Paciente.java](../backend/src/main/java/com/clinicks/model/Paciente.java)
- [HistorialMedico.java](../backend/src/main/java/com/clinicks/model/HistorialMedico.java)
- [Internacion.java](../backend/src/main/java/com/clinicks/model/Internacion.java)
- [HabitacionInternacion.java](../backend/src/main/java/com/clinicks/model/HabitacionInternacion.java)
- [RegistroClinico.java](../backend/src/main/java/com/clinicks/model/RegistroClinico.java)
- [FichaMedica.java](../backend/src/main/java/com/clinicks/model/FichaMedica.java)
- [Persona.java](../backend/src/main/java/com/clinicks/model/Persona.java)
- [InvitacionRegistro.java](../backend/src/main/java/com/clinicks/model/InvitacionRegistro.java)

### 5.5 DTOs

Sirven para no exponer directamente las entidades.

Se usan para:

1. Recibir datos de entrada.
2. Devolver datos al frontend.
3. Separar el modelo interno de la API pública.

Están en [backend/src/main/java/com/clinicks/dto](../backend/src/main/java/com/clinicks/dto).

### 5.6 Seguridad y errores

- [SecurityConfig.java](../backend/src/main/java/com/clinicks/security/SecurityConfig.java): define qué rutas son públicas y cuáles requieren autenticación.
- [JwtAuthFilter.java](../backend/src/main/java/com/clinicks/security/JwtAuthFilter.java): lee el token y carga la identidad del usuario.
- [JwtUtil.java](../backend/src/main/java/com/clinicks/security/JwtUtil.java): genera y valida JWT.
- [ManejadorGlobalDeExcepciones.java](../backend/src/main/java/com/clinicks/exception/ManejadorGlobalDeExcepciones.java): convierte errores en respuestas HTTP consistentes.

---

## 6. Flujo de una petición

La cadena real de comunicación suele ser esta:

Frontend -> Filtro JWT -> Controlador -> Servicio -> Repositorio -> Base de datos

Y en retorno:

Base de datos -> Repositorio -> Servicio -> Controlador -> Frontend

Ejemplo con un paciente:

1. El usuario completa el formulario.
2. El frontend envía un POST a [`/api/pacientes`](../backend/src/main/java/com/clinicks/controller/PacienteController.java#L19).
3. El controlador recibe el [`PacienteRequestDTO`](../backend/src/main/java/com/clinicks/dto/PacienteRequestDTO.java).
4. [`PacienteServiceImpl`](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java) valida DNI, afiliación, teléfonos y relaciones asociadas.
5. Los repositorios guardan persona, residencia, ficha médica y demás datos.
6. El backend devuelve un [`PacienteResponseDTO`](../backend/src/main/java/com/clinicks/dto/PacienteResponseDTO.java).
7. La UI se refresca con el nuevo estado.

---

## 7. Módulos funcionales del backend

### 7.1 Autenticación y registro

Archivos principales:

- [AuthController.java](../backend/src/main/java/com/clinicks/controller/AuthController.java)
- [AuthServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java)

Qué resuelve:

1. Inicio de sesión.
2. Registro con invitación.
3. Validación de tokens de invitación.
4. Creación y listado de invitaciones.
5. Consulta del usuario autenticado.

Comunicación principal:

- El controlador recibe la petición.
- El servicio valida la invitación o las credenciales.
- El repositorio consulta usuarios, roles e invitaciones.
- `JwtUtil` genera el token de sesión.

### 7.2 Pacientes

Archivos principales:

- [PacienteController.java](../backend/src/main/java/com/clinicks/controller/PacienteController.java)
- [PacienteServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java)

Qué resuelve:

1. Listar pacientes activos y desactivados.
2. Ver detalle de un paciente.
3. Crear y actualizar pacientes.
4. Dar de baja lógica y restaurar.
5. Validar DNI y número de afiliado.

Qué hace internamente el servicio:

1. Crea o actualiza `Persona`.
2. Resuelve `Residencia` y `Domicilio`.
3. Resuelve `FichaMedica`.
4. Crea o reutiliza `ObraSocial` y `AfiliacionObraSocial`.
5. Guarda teléfonos y contactos de emergencia.
6. Crea o recupera el historial clínico inicial.

### 7.3 Habitaciones e internaciones

Archivos principales:

- [HabitacionController.java](../backend/src/main/java/com/clinicks/controller/HabitacionController.java)
- [HabitacionServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java)

Qué resuelve:

1. Mostrar habitaciones con su estado.
2. Internar pacientes.
3. Trasladar internaciones.
4. Dar el egreso de una internación.
5. Cambiar el estado de una habitación libre.

Flujo interno típico:

1. Se busca la habitación o internación.
2. Se valida disponibilidad.
3. Se actualizan estados de habitación e internación.
4. Se registra un evento clínico automático en el historial.

### 7.4 Historial clínico

Archivos principales:

- [HistorialController.java](../backend/src/main/java/com/clinicks/controller/HistorialController.java)
- [HistorialServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java)

Qué resuelve:

1. Ver el historial completo de un paciente.
2. Separar eventos ambulatorios e internaciones.
3. Registrar nuevos eventos clínicos.
4. Listar tipos de procedimiento.

Idea clave:

El historial no es solo una lista de registros. El servicio también agrupa cada evento dentro de la internación correspondiente cuando aplica.

### 7.5 Administración de usuarios

Archivos principales:

- [AdminController.java](../backend/src/main/java/com/clinicks/controller/AdminController.java)
- [AdminServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java)

Qué resuelve:

1. Listar usuarios.
2. Cambiar roles.
3. Desactivar y reactivar usuarios.
4. Resetear contraseñas.

Reglas importantes:

1. No se modifica el administrador principal.
2. No se asigna el rol `ADMINISTRADOR` desde el panel.
3. Las bajas son lógicas mediante `deletedAt`.
4. El reset deja una contraseña temporal y obliga a cambiarla.

### 7.6 Perfil del usuario

Archivos principales:

- [PerfilController.java](../backend/src/main/java/com/clinicks/controller/PerfilController.java)
- [PerfilServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java)

Qué resuelve:

1. Consultar el perfil actual.
2. Cambiar email.
3. Cambiar contraseña.
4. Cambiar datos básicos.

---

## 8. Qué relación tiene cada carpeta con la otra

La lógica general del backend se entiende mejor así:

1. El frontend usa servicios HTTP.
2. Esos servicios llaman a los controladores del backend.
3. Los controladores delegan en servicios de negocio.
4. Los servicios usan repositorios para leer o guardar datos.
5. Los repositorios trabajan con entidades JPA.
6. Las entidades reflejan el modelo físico de PostgreSQL.

Esa separación permite que cada parte tenga una responsabilidad concreta y que sea más fácil ubicar errores o agregar funcionalidades.

---

## 9. Modelo de datos que conviene conocer primero

Si quieres entender el dominio clínico, empieza por estas piezas:

1. `paciente` y `persona`.
2. `residencia` y `domicilio`.
3. `ficha_medica`.
4. `historial_medico` y `registro_clinico`.
5. `habitacion_internacion` e `internacion`.
6. `usuario`, `rol` e `invitacion_registro`.

Relaciones que conviene memorizar:

1. Un paciente tiene una persona.
2. Un paciente tiene una residencia.
3. Un paciente tiene una ficha médica.
4. Un paciente puede tener afiliación a obra social.
5. Un historial médico agrupa registros clínicos e internaciones.
6. Una internación pertenece a una habitación y a un historial.
7. Un usuario pertenece a un rol.
8. Una invitación conecta un email, un rol y un usuario creador.

---

## 10. Cómo leer el proyecto por caso de uso

### 10.1 Crear un paciente

1. Ver el formulario en el frontend.
2. Seguir la llamada en `patientService`.
3. Entrar a [PacienteController.java](../backend/src/main/java/com/clinicks/controller/PacienteController.java).
4. Leer [PacienteServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java).
5. Revisar los repositorios involucrados.

### 10.2 Internar un paciente

1. Ver la acción desde la pantalla de habitaciones.
2. Seguir [HabitacionController.java](../backend/src/main/java/com/clinicks/controller/HabitacionController.java).
3. Revisar [HabitacionServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java).
4. Observar cómo se actualizan habitación, internación e historial.

### 10.3 Consultar historial

1. Ver la pantalla de historial.
2. Seguir [HistorialController.java](../backend/src/main/java/com/clinicks/controller/HistorialController.java).
3. Leer [HistorialServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java).
4. Revisar cómo se agrupan registros e internaciones.

### 10.4 Administrar usuarios

1. Ver el panel de administración.
2. Seguir [AdminController.java](../backend/src/main/java/com/clinicks/controller/AdminController.java).
3. Leer [AdminServiceImpl.java](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java).
4. Revisar las restricciones sobre el administrador principal.

---

## 11. Configuración y arranque

1. PostgreSQL debe estar disponible con el esquema cargado.
2. El backend toma su configuración desde [backend/src/main/resources/application.yml](../backend/src/main/resources/application.yml).
3. El frontend consume la API con la URL definida en su configuración.
4. El token se envía en el header `Authorization: Bearer ...`.

Orden recomendado para levantar el sistema:

1. Base de datos.
2. Backend.
3. Frontend.

---

## 12. Resumen corto

Si te pierdes, recuerda esta idea:

1. Los controladores reciben.
2. Los servicios deciden.
3. Los repositorios consultan y guardan.
4. Los modelos representan el negocio.
5. Los DTOs son lo que viaja por la API.

Esa es la estructura base del backend de Clinicks.
