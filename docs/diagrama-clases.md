# Diagrama de clases lógico de Clinicks

## Qué representa este documento

Este documento explica el diagrama de clases lógico del sistema, donde cada clase resume un concepto de negocio. Aquí se describen:

- Los atributos que forman cada concepto.
- Los métodos del diagrama y el lugar del código donde se implementan.
- Las relaciones principales.
- Tiene incluido un ejemplo del patron Builder usado.

El diagrama fuente está en [diagrama de clases/diagrama-clases.mermaid](diagrama%20de%20clases/diagrama-clases.mermaid).

## Diagrama

```mermaid
classDiagram
direction TB


class Persona {
  - String nombrePersona
  - String apellidoPersona
  - LocalDateTime fechaNacimiento
  - LocalDateTime fechaFallecimiento
  - getNombreCompleto(u : Usuario) String
  + cambiarNombre(nombre : String, apellido : String) void
}

class Usuario {
  - String email
  - String passwordHash
  - String autorizacion
  - boolean mustChangePassword
  - OffsetDateTime deletedAt
  - Rol rol
  - Persona persona
  + registrar(request : Register) Login
  + autenticar(request : Login) Login
  + obtenerUsuarioAutenticado(email : String) Usuario
  + obtenerPerfil(email : String) Perfil
  + esProtegido() boolean
  + cambiarPassword(email : String, request : CambiarPassword) Perfil
  + cambiarEmail(emailActual : String, request : CambiarEmail) Perfil
  + cambiarDatosBasicos(email : String, request : DatosBasicos) Perfil
}

class Administrador  {
  <<rol>>
  - cambiarRol(idUsuario : Integer, request : CambiarRol) AdminUsuario
  + listarUsuarios() List<AdminUsuario>
  + listarInvitaciones() List<Invitacion>
  + crearInvitacion(request : Invitacion, emailCreador : String) Invitacion
  + validarToken(token : String) Token
  + desactivarUsuario(idUsuario : Integer, emailSolicitante : String) AdminUsuario
  + activarUsuario(idUsuario : Integer) AdminUsuario
  + resetearPassword(idUsuario : Integer) Password
}

class Rol {
  - String nombreRol
  + tienePermiso(permiso : String) boolean
}

class Paciente {
  - Integer dni
  - OffsetDateTime deletedAt
  - Persona persona
  - Residencia residencia
  - FichaMedica fichaMedica
  - AfiliacionObraSocial afiliacion
  + crearPaciente(dto : Paciente, idUsuario : Integer) Paciente
  + existeDni(dni : Integer, excluirId : Integer) boolean
  - obtenerPacienteActivo(idPaciente : Integer) Paciente
  + filtrarPacientes(criterioBusqueda : String) List<Paciente>
  - validarTelefonoUnico(numero : String, excluirPacienteId : Integer) void
  - validarTelefonosSolicitud(telefono : String, contactos : List<ContactoEmergencia>, excluirPacienteId : Integer) void
  + listarPacientes() List<Paciente>
  + obtenerPacientePorId(id : Integer) Paciente
  + listarPacientesEliminados() List<Paciente>
  + actualizarDatos(idPaciente : Integer, dto : Paciente) Paciente
  + existeAfiliado(nroAfiliado : String, idObraSocial : Integer, nombreObraSocial : String, excluirId : Integer) boolean
  + eliminarPaciente(idPaciente : Integer) void
  + restaurarPaciente(idPaciente : Integer) void
  - agregarTelefono(paciente : Paciente, numero : String, tipo : String) void
  - agregarContactoEmergencia(paciente : Paciente, contactos : List<ContactoEmergencia>) void
}

class Residencia {
  - String tipoResidencia
  - Domicilio domicilio
  + cambiarDomicilio(idPaciente : Integer, dto : Paciente) Residencia
}

class Domicilio {
  - String calle
  - Integer numero
  - Integer piso
  - Localidad localidad
  + actualizarUbicacion(idPaciente : Integer, dto : Paciente) Domicilio
}

class Localidad {
  - String nombreLocalidad
  - Integer codigoPostal
  - Provincia provincia
  + actualizarLocalidad(idPaciente : Integer, dto : Paciente) Localidad
}

class Provincia {
  - String nombreProvincia
}

class ObraSocial {
  - String nombreObra
  - estaActiva(dto : Paciente) boolean
  + obtenerObraSocialPaciente(idPaciente : Integer) ObraSocial
}

class AfiliacionObraSocial {
  - String numeroAfiliado
  - LocalDate fechaAlta
  - LocalDate fechaVencimiento
  - LocalDate fechaBaja
  - ObraSocial obraSocial
  - estaVigente(dto : Paciente) boolean
  - darDeBaja(dto : Paciente) void
  - renovar(dto : Paciente) AfiliacionObraSocial
}

class FichaMedica {
  - String tipoSangre
  - String antecedentesText
  - Set<Alergia> alergias
  - Set<EnfermedadCronica> enfermedadesCronicas
  - Set<AntecedenteFamiliar> antecedentesFamiliares
  + crearFichaMedica(tipoSangre : String, alergias : List<String>, enfermedadesCronicas : List<String>, antecedentesFamiliares : List<String>) FichaMedica
  - agregarAlergia(ficha : FichaMedica, nombres : List<String>) void
  - agregarEnfermedadCronica(ficha : FichaMedica, nombres : List<String>) void
  - agregarAntecedenteFamiliar(ficha : FichaMedica, nombres : List<String>) void
  + actualizarAntecedentes(idPaciente : Integer, dto : Paciente) Paciente
}

class Alergia {
  - String nombreAlergia
}

class EnfermedadCronica {
  - String nombreEnfermedad
}

class AntecedenteFamiliar {
  - String nombreEnfermedad
}

class Telefono {
  - String numeroTelefono
  - String tipoTelefono
  - Paciente paciente
  - cambiarNumero(paciente : Paciente, numero : String, tipo : String) void
  - normalizarTelefono(telefono : String) String
}

class ContactoEmergencia {
  - String nombreCompleto
  - String parentesco
  - String telefonoCelular
  - Paciente paciente
  - actualizarContacto(paciente : Paciente, contactos : List<ContactoEmergencia>) void
}

namespace Patron_Builder {
  class HistorialMedico {
    <<Builder>>
    - LocalDateTime fechaCreacion
    - LocalDateTime fechaActualizacion
    - String observaciones
    - String estadoHistorial
    - Paciente paciente
    - List<RegistroClinico> registros
    - List<Internacion> internaciones
    + crearHistorialMedico(idPaciente : Integer, fechaCreacion : LocalDateTime, estado : String) HistorialMedico
    + obtenerHistorialMedico(idPaciente : Integer) HistorialMedico
    + registrarEvento(idPaciente : Integer, dto : RegistroClinico, idUsuario : Integer) void
    + agregarInternacion(idHabitacion : Integer, dto : Internacion, idUsuario : Integer) void
    + abrir(idPaciente : Integer) void
    - actualizarFechaModificacion(fechaActual : LocalDateTime) void
    + builder() Builder$
  }

  class TipoProcedimiento {
    - String nombreTipoProcedimiento
    + obtenerTipoProcedimiento(idTipoProcedimiento : Integer) TipoProcedimiento
    + listarTiposProcedimiento() List<TipoProcedimiento>
  }

  class RegistroClinico {
    <<Builder>>
    - String descripcion
    - LocalDateTime fechaRegistro
    - HistorialMedico historial
    - TipoProcedimiento tipoProcedimiento
    - Usuario usuario
    + crearRegistroClinico(descripcion : String, fechaActual : LocalDateTime, idHistorial : Integer, idTipoProcedimiento : Integer, idUsuario : Integer) RegistroClinico
    + registrarEventoInicial(nombreTipo : String, idHistorial : Integer, idUsuario : Integer) void
    + esAmbulatorio(idPaciente : Integer) boolean
    + builder() Builder$
  }
}
note for HistorialMedico "Patrón Builder: permite construir el historial con estado, fecha de creación, actualización y paciente."
note for RegistroClinico "Patrón Builder: permite crear registros clínicos completos con descripción, fecha, historial, tipo y usuario."

class Internacion {
  - LocalDateTime fechaInicio
  - LocalDateTime fechaFin
  - Integer cantidadTraslados
  - HistorialMedico historial
  - HabitacionInternacion habitacion
  + crearInternacion(fechaInicio : LocalDateTime, idHistorial : Integer, idHabitacion : Integer) Internacion
  + verificarInternacionActiva(idPaciente : Integer) boolean
  + consultarEstadoPaciente(idPaciente : Integer) String
  + trasladar(idInternacion : Integer, dto : Traslado, idUsuario : Integer) void
  + egresar(idInternacion : Integer, dto : Egreso, idUsuario : Integer) void
  - finalizar(dto : Egreso) String
}

class HabitacionInternacion {
  - String numeroHabitacion
  - Integer pisoHabitacion
  - String estadoHabitacion
  + obtenerHabitaciones() List<HabitacionInternacion>
  - estaDisponible(idHabitacion : Integer) boolean
  - ocupar(idHabitacion : Integer, nuevoEstado : String) void
  + actualizarEstadoHabitacion(idHabitacion : Integer, nuevoEstado : String) void
  + liberar(idHabitacion : Integer, nuevoEstado : String) void
}

class InvitacionRegistro {
  - String email
  - String token
  - Rol rol
  - Usuario usuarioCreador
  - LocalDateTime fechaCreacion
  - LocalDateTime fechaExpiracion
  - LocalDateTime fechaUso
  - OffsetDateTime deletedAt
  + estaVigente(token : String) boolean
  + aceptar(token : String) Login
}


Usuario "*" --> "1" Rol : rol
Usuario "1" --> "1" Persona : persona
Usuario "1" --> "0..1" Administrador : administrador
Paciente "1" --> "1" Persona : persona
Paciente "1" *-- "1" Residencia : residencia
Paciente "1" *-- "1" FichaMedica : fichaMedica
Paciente "*" --> "0..1" AfiliacionObraSocial : afiliacion
Paciente "1" --> "*" Telefono : telefonos
Paciente "1" --> "*" ContactoEmergencia : contactos
Paciente "1" --> "1" HistorialMedico : historiales
Residencia "1" *-- "1" Domicilio : domicilio
Domicilio "*" --> "1" Localidad : localidad
Localidad "*" --> "1" Provincia : provincia
AfiliacionObraSocial "*" --> "1" ObraSocial : obraSocial
FichaMedica "*" --> "*" Alergia : alergias
FichaMedica "*" --> "*" EnfermedadCronica : enfermedadesCronicas
FichaMedica "*" --> "*" AntecedenteFamiliar : antecedentesFamiliares
HistorialMedico "1" --> "*" RegistroClinico : registros
HistorialMedico "1" --> "*" Internacion : internaciones
RegistroClinico "*" --> "1" TipoProcedimiento : tipoProcedimiento
RegistroClinico "*" --> "1" Usuario : usuario
Internacion "*" --> "1" HabitacionInternacion : habitacion
InvitacionRegistro "*" --> "1" Rol : rol
InvitacionRegistro "*" --> "1" Usuario : usuarioCreador
```

## Cómo leerlo

Este diagrama muestra una sola clase por concepto de negocio. Las relaciones principales son:

- `Paciente` se apoya en `Persona`, `Residencia`, `FichaMedica` y `AfiliacionObraSocial`.
- `HistorialMedico` agrupa `RegistroClinico` e `Internacion`.
- `RegistroClinico` siempre pertenece a un `TipoProcedimiento` y a un `Usuario` que lo cargó.
- `InvitacionRegistro` vincula el alta de un usuario con `Rol` y `Usuario` creador.

## Mapeo de atributos y métodos al código

### Persona

- Atributos: `nombrePersona`, `apellidoPersona`, `fechaNacimiento`, `fechaFallecimiento` → [../backend/src/main/java/com/clinicks/model/Persona.java#L20](../backend/src/main/java/com/clinicks/model/Persona.java#L20)
- `getNombreCompleto(u : Usuario)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L197](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L197), [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L120](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L120), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L545](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L545)
- `cambiarNombre(String, String)` → [../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L81](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L81), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188)

### Usuario

- Atributos: `email`, `pass`, `autorizacion`, `mustChangePassword`, `deletedAt`, `rol`, `persona` → [../backend/src/main/java/com/clinicks/model/Usuario.java#L20](../backend/src/main/java/com/clinicks/model/Usuario.java#L20)
- `registrar(request : Register)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L64](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L64)
- `autenticar(request : Login)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L42](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L42), [../backend/src/main/java/com/clinicks/repository/UsuarioRepository.java#L24](../backend/src/main/java/com/clinicks/repository/UsuarioRepository.java#L24)
- `obtenerUsuarioAutenticado(email : String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L113](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L113)
- `obtenerPerfil(email : String)` → [../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L29](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L29)
- `esProtegido()` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L108-L182](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L108-L182)
- `cambiarPassword(email : String, request : CambiarPassword)` → [../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L60](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L60), [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L91](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L91)
- `cambiarEmail(emailActual : String, request : CambiarEmail)` → [../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L37](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L37)
- `cambiarDatosBasicos(email : String, request : DatosBasicos)` → [../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L81](../backend/src/main/java/com/clinicks/service/impl/PerfilServiceImpl.java#L81)

### Administrador

- `cambiarRol(idUsuario : Integer, request : CambiarRol)` → [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L26](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L26) (Retorna `AdminUsuario`)
- `listarUsuarios()` → [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L33-L37](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L33-L37) (Retorna lista de `AdminUsuario`)
- `listarInvitaciones()` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L159](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L159) (Retorna lista de `Invitacion`)
- `crearInvitacion(request : Invitacion, emailCreador : String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L121-L156](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L121-L156)
- `validarToken(token : String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L166](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L166) (Retorna `Token`)
- `desactivarUsuario(idUsuario : Integer, emailSolicitante : String)` → [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L63](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L63) (Retorna `AdminUsuario`)
- `activarUsuario(idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L79](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L79) (Retorna `AdminUsuario`)
- `resetearPassword(idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L91](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L91)

### Rol

- Atributos: `nombreRol` → [../backend/src/main/java/com/clinicks/model/Rol.java#L18](../backend/src/main/java/com/clinicks/model/Rol.java#L18)
- `tienePermiso(String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L56](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L56), [../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L52](../backend/src/main/java/com/clinicks/service/impl/AdminServiceImpl.java#L52)

### Paciente

- Atributos: `dni`, `deletedAt`, `persona`, `residencia`, `fichaMedica`, `afiliacion` → [../backend/src/main/java/com/clinicks/model/Paciente.java#L20](../backend/src/main/java/com/clinicks/model/Paciente.java#L20)
- `crearPaciente(dto : Paciente, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L108-L182](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L108-L182)
- `existeDni(dni : Integer, excluirId : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L78-L102](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L78-L102)
- `obtenerPacienteActivo(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L279](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L279)
- `filtrarPacientes(criterioBusqueda : String)` → Se resuelve en el frontend (filtro client-side).
- `listarPacientes()` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L53-L57](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L53-L57)
- `obtenerPacientePorId(id : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L71](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L71)
- `listarPacientesEliminados()` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L62-L67](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L62-L67)
- `actualizarDatos(idPaciente : Integer , dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188)
- `existeAfiliado(nroAfiliado : String, idObraSocial : Integer, nombreObraSocial : String, excluirId : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L87](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L87)
- `eliminarLogicamente(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L256](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L256)
- `restaurarPaciente(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L270](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L270)
- `agregarTelefono(paciente : Paciente, numero : String, tipo : String)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L454](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L454), [../backend/src/main/java/com/clinicks/repository/TelefonoRepository.java#L18](../backend/src/main/java/com/clinicks/repository/TelefonoRepository.java#L18)
- `agregarContactoEmergencia(paciente : Paciente, contactos : List<ContactoEmergencia>)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L464](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L464), [../backend/src/main/java/com/clinicks/repository/ContactoEmergenciaRepository.java#L17](../backend/src/main/java/com/clinicks/repository/ContactoEmergenciaRepository.java#L17)

### Residencia

- Atributos: `tipoResidencia`, `domicilio` → [../backend/src/main/java/com/clinicks/model/Residencia.java#L18](../backend/src/main/java/com/clinicks/model/Residencia.java#L18)
- `cambiarDomicilio(idPaciente : Integer, dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L139](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L139), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L222](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L222)

### Domicilio

- Atributos: `calle`, `numero`, `piso`, `localidad` → [../backend/src/main/java/com/clinicks/model/Domicilio.java#L18](../backend/src/main/java/com/clinicks/model/Domicilio.java#L18)
- `actualizarUbicacion(idPaciente : Integer, dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L129](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L129), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L223](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L223)

### Localidad

- Atributos: `nombreLocalidad`, `codigoPostal`, `provincia` → [../backend/src/main/java/com/clinicks/model/Localidad.java#L18](../backend/src/main/java/com/clinicks/model/Localidad.java#L18)
- `actualizarLocalidad(idPaciente : Integer, dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L127](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L127), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L231](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L231)

### Provincia

- Atributos: `nombreProvincia` → [../backend/src/main/java/com/clinicks/model/Provincia.java#L18](../backend/src/main/java/com/clinicks/model/Provincia.java#L18)

### ObraSocial

- Atributos: `nombreObra` → [../backend/src/main/java/com/clinicks/model/ObraSocial.java#L18](../backend/src/main/java/com/clinicks/model/ObraSocial.java#L18)
- `estaActiva(dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405)
- `obtenerObraSocialPaciente(idPaciente : Integer)` → Se resuelve inline en la proyección SQL del repositorio: [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L54](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L54)

### AfiliacionObraSocial

- Atributos: `numeroAfiliado`, `fechaAlta`, `fechaVencimiento`, `fechaBaja`, `obraSocial` → [../backend/src/main/java/com/clinicks/model/AfiliacionObraSocial.java#L20](../backend/src/main/java/com/clinicks/model/AfiliacionObraSocial.java#L20)
- `estaVigente(dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405)
- `darDeBaja(dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L405)
- `renovar(dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L439](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L439)

### FichaMedica

- Atributos: `tipoSangre`, `antecedentesText`, `alergias`, `enfermedadesCronicas`, `antecedentesFamiliares` → [../backend/src/main/java/com/clinicks/model/FichaMedica.java#L21](../backend/src/main/java/com/clinicks/model/FichaMedica.java#L21)
- `crearFichaMedica(tipoSangre : String, alergias : List<String>, enfermedadesCronicas : List<String>, antecedentesFamiliares : List<String>)` → Creado inline en [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L122-L125](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L122-L125)
- `agregarAlergia(ficha : FichaMedica, nombres : List<String>)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L349](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L349)
- `agregarEnfermedadCronica(ficha : FichaMedica, nombres : List<String>)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L361](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L361)
- `agregarAntecedenteFamiliar(ficha : FichaMedica, nombres : List<String>)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L373](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L373)
- `actualizarAntecedentes(idPaciente : Integer , dto : Paciente)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L188)

### Alergia / EnfermedadCronica / AntecedenteFamiliar

- Atributos de cada una: identificador y nombre → [../backend/src/main/java/com/clinicks/model/Alergia.java#L18](../backend/src/main/java/com/clinicks/model/Alergia.java#L18), [../backend/src/main/java/com/clinicks/model/EnfermedadCronica.java#L18](../backend/src/main/java/com/clinicks/model/EnfermedadCronica.java#L18), [../backend/src/main/java/com/clinicks/model/AntecedenteFamiliar.java#L18](../backend/src/main/java/com/clinicks/model/AntecedenteFamiliar.java#L18)

### Telefono

- Atributos: `numeroTelefono`, `tipoTelefono`, `paciente` → [../backend/src/main/java/com/clinicks/model/Telefono.java#L18](../backend/src/main/java/com/clinicks/model/Telefono.java#L18)
- `cambiarNumero(paciente : Paciente ,numero : String , tipo : String)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L454](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L454)
- `normalizarTelefono(telefono : String)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L299](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L299)

### ContactoEmergencia

- Atributos: `nombreCompleto`, `parentesco`, `telefonoCelular`, `paciente` → [../backend/src/main/java/com/clinicks/model/ContactoEmergencia.java#L18](../backend/src/main/java/com/clinicks/model/ContactoEmergencia.java#L18)
- `actualizarContacto(paciente : Paciente, contactos : List<ContactoEmergencia>)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L464](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L464)

### HistorialMedico

- Atributos: `fechaCreacion`, `fechaActualizacion`, `observaciones`, `estadoHistorial`, `paciente`, `registros`, `internaciones` → [../backend/src/main/java/com/clinicks/model/HistorialMedico.java#L20](../backend/src/main/java/com/clinicks/model/HistorialMedico.java#L20)
- `builder()` → Implementado vía Lombok en [../backend/src/main/java/com/clinicks/model/HistorialMedico.java#L12](../backend/src/main/java/com/clinicks/model/HistorialMedico.java#L12). Usado en lógica de negocio, ej: [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L165](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L165)
- `crearHistorialMedico(idPaciente : Integer, fechaCreacion : LocalDateTime, estado : String)` → Creado inline en [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L164-L170](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L164-L170)
- `obtenerHistorialMedico(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L54-L60](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L54-L60)
- `registrarEvento(idPaciente : Integer, dto : RegistroClinico, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L119](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L119), [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L479](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L479), [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L147](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L147)
- `agregarInternacion(idHabitacion : Integer , dto : Internacion , idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L39](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L39)
- `abrir(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L164](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L164), [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L36](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L36)
- `actualizarFechaModificacion(fechaActual : LocalDateTime)` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L145-L146](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L145-L146)

### TipoProcedimiento

- Atributos: `nombreTipoProcedimiento` → [../backend/src/main/java/com/clinicks/model/TipoProcedimiento.java#L20](../backend/src/main/java/com/clinicks/model/TipoProcedimiento.java#L20)
- `obtenerTipoProcedimiento(idTipoProcedimiento : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L131-L132](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L131-L132)
- `listarTiposProcedimiento()` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L151](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L151)

### RegistroClinico

- Atributos: `descripcion`, `fechaRegistro`, `historial`, `tipoProcedimiento`, `usuario` → [../backend/src/main/java/com/clinicks/model/RegistroClinico.java#L20](../backend/src/main/java/com/clinicks/model/RegistroClinico.java#L20)
- `builder()` → Implementado vía Lombok en [../backend/src/main/java/com/clinicks/model/RegistroClinico.java#L12](../backend/src/main/java/com/clinicks/model/RegistroClinico.java#L12). Usado en lógica de negocio, ej: [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L137](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L137)
- `crearRegistroClinico(descripcion : String, fechaActual : LocalDateTime, idHistorial : Integer, idTipoProcedimiento : Integer, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L137-L143](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L137-L143)
- `registrarEventoInicial(nombreTipo : String, idHistorial : Integer, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L479-L494](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L479-L494)
- `esAmbulatorio(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L68](../backend/src/main/java/com/clinicks/service/impl/HistorialServiceImpl.java#L68)

### Internacion

- Atributos: `fechaInicio`, `fechaFin`, `cantidadTraslados`, `historial`, `habitacion` → [../backend/src/main/java/com/clinicks/model/Internacion.java#L20](../backend/src/main/java/com/clinicks/model/Internacion.java#L20)
- `crearInternacion(fechaInicio : LocalDateTime, idHistorial : Integer, idHabitacion : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L62-L68](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L62-L68)
- `verificarInternacionActiva(idPaciente : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L258](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L258)
- `consultarEstadoPaciente(idPaciente : Integer)` → Se resuelve en la proyección SQL del repositorio: [../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L54](../backend/src/main/java/com/clinicks/service/impl/PacienteServiceImpl.java#L54)
- `trasladar(idInternacion : Integer , dto : Traslado, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L78](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L78)
- `egresar(idInternacion : Integer, dto : Egreso, idUsuario : Integer)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L109](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L109)
- `finalizar(dto : Egreso)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L189](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L189)

### HabitacionInternacion

- Atributos: `numeroHabitacion`, `pisoHabitacion`, `estadoHabitacion` → [../backend/src/main/java/com/clinicks/model/HabitacionInternacion.java#L18](../backend/src/main/java/com/clinicks/model/HabitacionInternacion.java#L18)
- `obtenerHabitaciones()` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L30-L35](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L30-L35)
- `estaDisponible(idHabitacion : Integer)` / `ocupar(idHabitacion : Integer , nuevoEstado: String)` / `liberar(idHabitacion : Integer, nuevoEstado: String)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L134](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L134), [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L43](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L43), [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L121](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L121)
- `actualizarEstadoHabitacion(idHabitacion : Integer, nuevoEstado : String)` → [../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L134-L145](../backend/src/main/java/com/clinicks/service/impl/HabitacionServiceImpl.java#L134-L145)

### InvitacionRegistro

- Atributos: `email`, `token`, `rol`, `usuarioCreador`, `fechaCreacion`, `fechaExpiracion`, `fechaUso`, `deletedAt` → [../backend/src/main/java/com/clinicks/model/InvitacionRegistro.java#L21](../backend/src/main/java/com/clinicks/model/InvitacionRegistro.java#L21)
- `estaVigente(token : String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L165](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L165)
- `aceptar(token : String)` → [../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L64](../backend/src/main/java/com/clinicks/service/impl/AuthServiceImpl.java#L64) (Retorna `Login`)
