package com.clinicks.exception;

public class PacienteNoEncontradoException extends RuntimeException {

    public PacienteNoEncontradoException(Integer id) {
        super("Paciente no encontrado con id: " + id);
    }
}
