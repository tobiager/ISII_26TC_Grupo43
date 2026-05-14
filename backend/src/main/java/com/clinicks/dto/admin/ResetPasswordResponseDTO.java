package com.clinicks.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResetPasswordResponseDTO {
    private String message;
    private String temporaryPassword;
}
