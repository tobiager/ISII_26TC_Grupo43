package com.clinicks.dto.perfil;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarDatosBasicosRequestDTO {
    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    private String fechaNacimiento;
}
