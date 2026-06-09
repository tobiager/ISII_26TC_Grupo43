package com.clinicks.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarRolRequestDTO {

    @NotBlank(message = "El rol es obligatorio")
    private String rol;
}
