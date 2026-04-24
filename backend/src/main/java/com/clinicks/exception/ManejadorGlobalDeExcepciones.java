package com.clinicks.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManejadorGlobalDeExcepciones {

    @ExceptionHandler(PacienteNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(PacienteNoEncontradoException ex) {
        return construirError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DniDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarDniDuplicado(DniDuplicadoException ex) {
        return construirError(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AfiliadoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarAfiliadoDuplicado(AfiliadoDuplicadoException ex) {
        return construirError(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(TelefonoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarTelefonoDuplicado(TelefonoDuplicadoException ex) {
        return construirError(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> manejarIntegridadDeDatos(DataIntegrityViolationException ex) {
        String mensaje = resolverMensajeConstraint(ex);
        return construirError(HttpStatus.CONFLICT, mensaje);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Errores de validación");
        body.put("campos", errores);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGenerico(Exception ex) {
        return construirError(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Por favor intente nuevamente.");
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private String resolverMensajeConstraint(DataIntegrityViolationException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        if (msg == null) return "Error de integridad en los datos ingresados.";

        if (msg.contains("uq_telefono_numero")) {
            return "El número de teléfono ingresado ya está registrado en el sistema.";
        }
        if (msg.contains("uq_dni") || msg.contains("paciente_dni")) {
            return "El DNI ingresado ya corresponde a un paciente registrado.";
        }
        if (msg.contains("uq_numero_afiliado") || msg.contains("numero_afiliado")) {
            return "El número de afiliado ya existe en el sistema.";
        }
        if (msg.contains("not-null") || msg.contains("null value")) {
            return "Hay campos obligatorios sin completar.";
        }
        return "Error de integridad en los datos ingresados. Verifique que no existan valores duplicados.";
    }

    private ResponseEntity<Map<String, Object>> construirError(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
