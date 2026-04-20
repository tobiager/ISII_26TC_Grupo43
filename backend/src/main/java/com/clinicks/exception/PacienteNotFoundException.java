package com.clinicks.exception;

public class PacienteNotFoundException extends RuntimeException {

    public PacienteNotFoundException(Integer id) {
        super("Paciente no encontrado con id: " + id);
    }
}
