package com.clinicks.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactoEmergenciaDTO {
    private String nombre;
    private String telefono;
    private String parentesco;
}
