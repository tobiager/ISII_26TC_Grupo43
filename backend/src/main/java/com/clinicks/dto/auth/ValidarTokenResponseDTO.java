package com.clinicks.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidarTokenResponseDTO {

    private String email;
    private String rol;
}
