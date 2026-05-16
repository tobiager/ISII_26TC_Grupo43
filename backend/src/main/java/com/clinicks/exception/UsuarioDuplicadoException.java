package com.clinicks.exception;

public class UsuarioDuplicadoException extends RuntimeException {

    public UsuarioDuplicadoException(String email) {
        super("Ya existe un usuario registrado con el email: " + email);
    }
}
