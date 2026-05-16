package com.clinicks.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InvitacionResponseDTO {

    private Integer idInvitacion;
    private String email;
    private String rol;
    private String invitationLink;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaExpiracion;
    private LocalDateTime fechaUso;
    private boolean usada;
    private boolean vencida;
}
