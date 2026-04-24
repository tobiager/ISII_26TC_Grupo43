package com.clinicks.exception;

public class TelefonoDuplicadoException extends RuntimeException {

    public TelefonoDuplicadoException(String numero) {
        super("El número de teléfono '" + numero + "' ya está registrado en el sistema.");
    }
}
