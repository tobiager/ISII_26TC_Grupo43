package com.clinicks.exception;

public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException() {
        super("Credenciales inválidas. Verifique su email y contraseña.");
    }
}
