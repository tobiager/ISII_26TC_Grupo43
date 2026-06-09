package com.clinicks.exception;

public class HabitacionNoDisponibleException extends RuntimeException {
    public HabitacionNoDisponibleException(String numero) {
        super("La habitación " + numero + " no está disponible.");
    }
}
