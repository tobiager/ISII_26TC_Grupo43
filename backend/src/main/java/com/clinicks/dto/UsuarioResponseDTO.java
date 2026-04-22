package com.clinicks.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponseDTO {

    private Integer id;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String iniciales;
    private String rol;
}
