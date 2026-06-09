package com.clinicks.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUsuarioDTO {

    private Integer idUsuario;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String iniciales;
    private String rol;
    private String autorizacion;
    private boolean activo;
}
