package com.clinicks.exception;

public class InternacionNoEncontradaException extends RuntimeException {
    public InternacionNoEncontradaException(Integer id) {
        super("Internación no encontrada con id: " + id);
    }
    public InternacionNoEncontradaException(String msg) {
        super(msg);
    }
}
