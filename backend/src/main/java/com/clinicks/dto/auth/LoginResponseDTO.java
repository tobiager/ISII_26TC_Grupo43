package com.clinicks.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {

    private String token;
    private UsuarioAuthDTO usuario;

    @Data
    @Builder
    public static class UsuarioAuthDTO {
        private Integer idUsuario;
        private String email;
        private String nombre;
        private String apellido;
        private String nombreCompleto;
        private String iniciales;
        private String rol;
        private String autorizacion;
    }
}
