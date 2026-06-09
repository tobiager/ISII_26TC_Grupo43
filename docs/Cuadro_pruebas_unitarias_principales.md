# Cuadro de Pruebas Unitarias

## Método: `crearPaciente(PacienteRequestDTO dto, Integer idUsuario)`

> [!NOTE]
> Este método registra un nuevo paciente en el sistema. Recibe un DTO con los datos personales, médicos, de contacto y residencia del paciente, junto con el ID del usuario que lo registra.

| nombre | apellido | dni | telefono | Descripción | Resultado esperado |
|---|---|---|---|---|---|
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` | Registro exitoso con datos mínimos válidos | Se crea el paciente y se devuelve un `PacienteResponseDTO` con DNI 12345678 |
| `"JUAN carlos"` | `"del VALLE"` | `12345678` | `"1123456789"` | Registro con nombre en mayúsculas/minúsculas mixtas; se verifica la normalización | Se crea el paciente con nombre `"Juan Carlos"` y apellido `"Del Valle"` |
| `"juan carlos"` | `"del valle"` | `12345678` *(ya existente)* | `"1123456789"` | Intento de registro con DNI ya existente en el sistema | Se lanza `DniDuplicadoException` con mensaje que contiene "12345678" |
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` *(ya existente en tabla teléfono)* | Intento de registro con teléfono ya registrado como teléfono personal de otro paciente | Se lanza `TelefonoDuplicadoException` con mensaje que contiene "1123456789" |
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` *(ya existente en contacto emergencia)* | Intento de registro con teléfono ya registrado como contacto de emergencia de otro paciente | Se lanza `TelefonoDuplicadoException` |
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` + contactos con tel repetido `"1187654321"` x2 | Intento de registro con dos contactos de emergencia que tienen el mismo número de teléfono | Se lanza `TelefonoDuplicadoException` con mensaje que contiene "1187654321" |
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` + obraSocial con nroAfiliado `"ABC123"` *(duplicado)* | Intento de registro con número de afiliado ya existente para la misma obra social | Se lanza `AfiliadoDuplicadoException` con mensaje que contiene "ABC123" |
| `"juan carlos"` | `"del valle"` | `12345678` | `"1123456789"` + dirección `null` | Registro sin dirección, se verifica que use valor por defecto | Se crea el paciente con dirección `"Sin dirección"` |

---

## Método: `internarPaciente(Integer idHabitacion, InternacionRequestDTO dto, Integer idUsuario)`

> [!NOTE]
> Este método registra la internación de un paciente en una habitación. Recibe el ID de la habitación, un DTO con el ID del paciente, motivo y observaciones, y el ID del usuario que ejecuta la acción.

| idHabitacion | idPaciente | motivo | observaciones | Estado habitación | Estado paciente | Descripción | Resultado esperado |
|---|---|---|---|---|---|---|---|
| `1` | `10` | `"Dolor abdominal"` | `"Se asigna por observación"` | Disponible | No internado | Internación exitosa con todos los datos válidos | La habitación pasa a estado `"ocupada"`, se crea registro de internación y evento en historial |
| `2` | `10` | `"Dolor abdominal"` | `"Se asigna por observación"` | Ocupada | No internado | Intento de internación en habitación ocupada | Se lanza `HabitacionNoDisponibleException`: "La habitación 102 no está disponible." |
| `3` | `10` | `"Dolor abdominal"` | `"Se asigna por observación"` | Mantenimiento | No internado | Intento de internación en habitación en mantenimiento | Se lanza `HabitacionNoDisponibleException`: "La habitación 103 no está disponible." |
| `1` | `10` | `"Dolor abdominal"` | `null` | Disponible | No internado | Internación exitosa sin observaciones (campo opcional) | Se asigna la habitación correctamente. La habitación pasa a `"ocupada"`, se crea registro de internación y evento en historial sin observaciones |
| `1` | `10` *(inexistente)* | `"Dolor abdominal"` | `"Observación"` | Disponible | — | Intento de internación de paciente que no existe en el sistema | Se lanza `PacienteNoEncontradoException` con mensaje que contiene "10" |
| `1` | `10` | `"Dolor abdominal"` | `"Observación"` | Disponible | Ya internado | Intento de internación de paciente que ya está internado en otra habitación | Se lanza `OperacionNoPermitidaException`: "El paciente ya se encuentra internado." |
| `1` *(inexistente)* | `10` | `"Dolor abdominal"` | `"Observación"` | — | No internado | Intento de internación en habitación que no existe en el sistema | Se lanza `RuntimeException`: "Habitación no encontrada" |
| `1` | `10` | `"Control post-op"` | `"Paciente estable"` | Disponible | No internado, sin historial previo | Internación de paciente que no tiene historial médico previo | Se crea un nuevo historial médico automáticamente, se asigna la habitación y se registra el evento |
