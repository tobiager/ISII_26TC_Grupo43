# Guía del Frontend y su Comunicación con el Backend

## 1. Objetivo

Esta guía explica cómo está organizado el frontend de Clinicks, qué archivo mirar primero y, sobre todo, en qué puntos se comunica con el backend.

La idea es que puedas ubicar rápido:

1. Dónde vive cada pantalla.
2. Dónde están las llamadas HTTP.
3. Qué servicios del frontend hablan con qué controladores del backend.
4. Cómo viaja una acción desde un componente React hasta la API REST.

---

## 2. Tecnología del frontend

El frontend está construido con:

1. React 18.
2. Vite.
3. TypeScript.
4. React Router.
5. Axios.
6. Sonner para notificaciones.

Los scripts principales están en [frontend/package.json](../frontend/package.json).

---

## 3. Estructura del frontend

La carpeta principal está en [frontend/src](../frontend/src).

### 3.1 Carpetas importantes

- [frontend/src/pages](../frontend/src/pages): pantallas completas.
- [frontend/src/components](../frontend/src/components): piezas reutilizables.
- [frontend/src/services](../frontend/src/services): capa de comunicación con el backend.
- [frontend/src/contexts](../frontend/src/contexts): estado global, sobre todo autenticación.
- [frontend/src/types](../frontend/src/types): contratos de datos.
- [frontend/src/utils](../frontend/src/utils): utilidades de permisos y apoyo visual.
- [frontend/src/validations](../frontend/src/validations): validaciones de formularios.

### 3.2 Punto de arranque

El flujo de la aplicación empieza en [frontend/src/main.tsx](../frontend/src/main.tsx) y [frontend/src/App.tsx](../frontend/src/App.tsx).

En [App.tsx](../frontend/src/App.tsx) se definen las rutas:

- Públicas: `/login` y `/register`.
- Protegidas para usuarios autenticados: `/`, `/pacientes`, `/habitaciones`, `/historial`, `/historial/:id`.
- Protegidas solo para `ADMINISTRADOR`: `/admin`.

---

## 4. Dónde se comunica con el backend

La comunicación con la API no ocurre directamente desde las páginas. La ruta normal es:

Componente o página -> servicio del frontend -> cliente HTTP común -> backend

### 4.1 Cliente HTTP común

El archivo central es [frontend/src/services/apiClient.ts](../frontend/src/services/apiClient.ts).

Ahí se define:

1. La base de la URL con `VITE_API_URL` o, si no existe, `/api`.
2. El envío automático del token JWT guardado en `localStorage` bajo `clinicks_token`.
3. El manejo de respuestas `401`, limpiando el estado local y mandando al login.

Ese archivo es el punto común para casi todas las llamadas autenticadas.

### 4.2 Login y registro sin token

El archivo [frontend/src/services/authService.ts](../frontend/src/services/authService.ts) usa dos clientes:

- `publicApi` para `login`, `register` y `validarToken`.
- `apiClient` para el resto de operaciones autenticadas.

Esto es importante porque el login todavía no tiene JWT, así que no puede pasar por el interceptor de autenticación.

### 4.3 Estado de autenticación

El estado global está en [frontend/src/contexts/AuthContext.tsx](../frontend/src/contexts/AuthContext.tsx).

Ese contexto:

1. Guarda el usuario en memoria de React.
2. Recupera el usuario y el token desde `localStorage` al arrancar.
3. Expone `login`, `logout`, `hasRole` y `updateUser`.
4. Permite que la UI sepa si el usuario está autenticado sin volver a pedir todo al backend.

---

## 5. Mapa de comunicación por módulo

### 5.1 Autenticación y perfil

Frontend principal:

- [frontend/src/pages/LoginPage.tsx](../frontend/src/pages/LoginPage.tsx)
- [frontend/src/pages/RegisterPage.tsx](../frontend/src/pages/RegisterPage.tsx)
- [frontend/src/pages/AdminPage.tsx](../frontend/src/pages/AdminPage.tsx)
- [frontend/src/components/CambiarPasswordModal.tsx](../frontend/src/components/CambiarPasswordModal.tsx)
- [frontend/src/components/CambiarEmailModal.tsx](../frontend/src/components/CambiarEmailModal.tsx)

Servicio principal:

- [frontend/src/services/authService.ts](../frontend/src/services/authService.ts)

Backend relacionado:

- [backend/src/main/java/com/clinicks/controller/AuthController.java](../backend/src/main/java/com/clinicks/controller/AuthController.java)
- [backend/src/main/java/com/clinicks/controller/AdminController.java](../backend/src/main/java/com/clinicks/controller/AdminController.java)
- [backend/src/main/java/com/clinicks/controller/PerfilController.java](../backend/src/main/java/com/clinicks/controller/PerfilController.java)

Endpoints usados:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/me`
- `/api/auth/invitations/validate`
- `/api/auth/invitations`
- `/api/admin/users`
- `/api/admin/users/{id}/role`
- `/api/admin/users/{id}/disable`
- `/api/admin/users/{id}/enable`
- `/api/admin/users/{id}/reset-password`
- `/api/profile`
- `/api/profile/password`
- `/api/profile/email`
- `/api/profile/basic-data`

Flujo típico:

1. `LoginPage` llama a `authService.login`.
2. El backend devuelve token y usuario.
3. `AuthContext` guarda ambos en `localStorage`.
4. Las demás pantallas ya pueden usar `apiClient` con el JWT automático.

### 5.2 Pacientes

Frontend principal:

- [frontend/src/pages/PatientsPage.tsx](../frontend/src/pages/PatientsPage.tsx)
- [frontend/src/components/PatientForm.tsx](../frontend/src/components/PatientForm.tsx)
- [frontend/src/components/PatientTable.tsx](../frontend/src/components/PatientTable.tsx)
- [frontend/src/components/PatientDetailModal.tsx](../frontend/src/components/PatientDetailModal.tsx)

Servicio principal:

- [frontend/src/services/patientService.ts](../frontend/src/services/patientService.ts)

Backend relacionado:

- [backend/src/main/java/com/clinicks/controller/PacienteController.java](../backend/src/main/java/com/clinicks/controller/PacienteController.java)

Endpoints usados:

- `/api/pacientes`
- `/api/pacientes/desactivados`
- `/api/pacientes/{id}`
- `/api/pacientes/existe-dni`
- `/api/pacientes/existe-afiliado`
- `/api/pacientes/{id}/restaurar`

Flujo típico:

1. `PatientsPage` carga la grilla con `patientService.getAll`.
2. `PatientForm` valida datos y consulta provincias, obras sociales y localidades antes de enviar.
3. Al guardar, `patientService.create` o `patientService.update` llama al backend.
4. Si el backend responde error de validación, la pantalla muestra el mensaje devuelto.

### 5.3 Habitaciones e internaciones

Frontend principal:

- [frontend/src/pages/HabitacionesPage.tsx](../frontend/src/pages/HabitacionesPage.tsx)

Servicio principal:

- [frontend/src/services/roomService.ts](../frontend/src/services/roomService.ts)

Backend relacionado:

- [backend/src/main/java/com/clinicks/controller/HabitacionController.java](../backend/src/main/java/com/clinicks/controller/HabitacionController.java)

Endpoints usados:

- `/api/habitaciones`
- `/api/habitaciones/{id}/internar`
- `/api/internaciones/{id}/trasladar`
- `/api/internaciones/{id}/egresar`
- `/api/habitaciones/{id}/estado`

Flujo típico:

1. La página pide el listado de habitaciones con `roomService.getAll`.
2. También carga pacientes con `patientService.getAll` para internarlos.
3. Las acciones de internar, trasladar y egresar viajan por `roomService` al backend.

### 5.4 Historial clínico

Frontend principal:

- [frontend/src/pages/HistorialPage.tsx](../frontend/src/pages/HistorialPage.tsx)
- [frontend/src/pages/PatientHistorialPage.tsx](../frontend/src/pages/PatientHistorialPage.tsx)
- [frontend/src/components/PatientDetailModal.tsx](../frontend/src/components/PatientDetailModal.tsx)

Servicio principal:

- [frontend/src/services/historialService.ts](../frontend/src/services/historialService.ts)

Backend relacionado:

- [backend/src/main/java/com/clinicks/controller/HistorialController.java](../backend/src/main/java/com/clinicks/controller/HistorialController.java)

Endpoints usados:

- `/api/historial/{idPaciente}`
- `/api/historial/tipos-procedimiento`
- `/api/historial/{idPaciente}/registros`

Flujo típico:

1. La pantalla del historial carga el paciente seleccionado.
2. `historialService.getByPaciente` trae el detalle completo.
3. `historialService.getTiposProcedimiento` llena el selector de eventos.
4. `historialService.registrarEvento` crea un nuevo registro clínico.

### 5.5 Catálogos y datos auxiliares

Frontend principal:

- [frontend/src/components/PatientForm.tsx](../frontend/src/components/PatientForm.tsx)

Servicio principal:

- [frontend/src/services/locationService.ts](../frontend/src/services/locationService.ts)

Backend relacionado:

- [backend/src/main/java/com/clinicks/controller/ProvinciaController.java](../backend/src/main/java/com/clinicks/controller/ProvinciaController.java)
- [backend/src/main/java/com/clinicks/controller/LocalidadController.java](../backend/src/main/java/com/clinicks/controller/LocalidadController.java)
- [backend/src/main/java/com/clinicks/controller/ObraSocialController.java](../backend/src/main/java/com/clinicks/controller/ObraSocialController.java)

Endpoints usados:

- `/api/provincias`
- `/api/localidades`
- `/api/obras-sociales`

Estos datos alimentan principalmente el formulario de pacientes.

---

## 6. Flujo real de una petición

La cadena habitual es esta:

Componente -> servicio -> apiClient -> controlador backend -> servicio backend -> repositorio -> base de datos

Y de vuelta:

Base de datos -> repositorio -> servicio backend -> controlador backend -> servicio frontend -> UI

Ejemplo con un paciente:

1. El usuario abre el formulario desde [PatientsPage](../frontend/src/pages/PatientsPage.tsx).
2. `PatientForm` valida y normaliza los datos.
3. `patientService.create` envía un `POST` a `/api/pacientes`.
4. `PacienteController` recibe el request.
5. El servicio del backend aplica reglas de negocio y guarda la información.
6. El frontend recibe la respuesta y refresca la tabla.

---

## 7. Cómo se controla el acceso

La restricción de acceso está repartida en dos niveles:

1. En frontend, [frontend/src/components/ProtectedRoute.tsx](../frontend/src/components/ProtectedRoute.tsx) bloquea rutas según autenticación y rol.
2. En backend, Spring Security protege los endpoints y el interceptor del cliente agrega el JWT a cada llamada.

Además, la lógica de permisos de la interfaz vive en [frontend/src/utils/permissions.ts](../frontend/src/utils/permissions.ts).

---

## 8. Notas útiles para no confundirse

1. El endpoint real de perfil usado por el backend es `/api/profile`.
2. Existe también un controlador antiguo en `/api/usuarios/perfil`, pero hoy el flujo de perfil de la app pasa por `authService` y `PerfilController`.
3. Algunas llamadas usan `AbortSignal` para cancelar requests si el componente se desmonta.
4. El token y el usuario se guardan en `localStorage` como `clinicks_token` y `clinicks_user`.

---

## 9. Si quieres agregar una nueva pantalla

La forma más limpia es esta:

1. Crear la página en [frontend/src/pages](../frontend/src/pages).
2. Crear o ampliar un servicio en [frontend/src/services](../frontend/src/services).
3. Reutilizar [frontend/src/services/apiClient.ts](../frontend/src/services/apiClient.ts) para que el token viaje solo.
4. Definir tipos en [frontend/src/types](../frontend/src/types).
5. Conectar la ruta en [frontend/src/App.tsx](../frontend/src/App.tsx).

Si la pantalla necesita datos del backend, primero identifica el controlador y el endpoint que corresponden, y después modela el servicio del frontend encima de eso.