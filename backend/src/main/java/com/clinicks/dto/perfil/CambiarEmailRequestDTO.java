package com.clinicks.dto.perfil;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarEmailRequestDTO {
    @NotBlank
    @Email
    private String nuevoEmail;

    @NotBlank
    private String passwordActual;
}
