package com.clinicks.exception;

public class AfiliadoDuplicadoException extends RuntimeException {
    public AfiliadoDuplicadoException(String numeroAfiliado) {
        super("El número de afiliado " + numeroAfiliado + " ya está registrado para esta obra social.");
    }
}
