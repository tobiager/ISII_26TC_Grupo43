package com.clinicks.exception;

public class UsuarioNoEncontradoException extends RuntimeException {

    public UsuarioNoEncontradoException(Integer id) {
        super("No se encontró ningún usuario activo con ID: " + id);
    }
}
