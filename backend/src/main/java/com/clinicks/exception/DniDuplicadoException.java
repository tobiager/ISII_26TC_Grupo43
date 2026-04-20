package com.clinicks.exception;

public class DniDuplicadoException extends RuntimeException {

    public DniDuplicadoException(Integer dni) {
        super("Ya existe un paciente registrado con DNI: " + dni);
    }
}
