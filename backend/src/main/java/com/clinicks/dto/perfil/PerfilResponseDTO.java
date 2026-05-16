package com.clinicks.dto.perfil;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PerfilResponseDTO {
    private Integer idUsuario;
    private String email;
    private String nombre;
    private String apellido;
    private String rol;
    private String autorizacion;
    private boolean mustChangePassword;
    private boolean esAdminProtegido;
}
