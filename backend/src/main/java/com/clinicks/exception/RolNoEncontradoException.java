package com.clinicks.exception;

public class RolNoEncontradoException extends RuntimeException {

    public RolNoEncontradoException(String nombreRol) {
        super("El rol '" + nombreRol + "' no existe en el sistema.");
    }
}
