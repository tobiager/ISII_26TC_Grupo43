package com.clinicks.dto.historial;

import lombok.Data;

@Data
public class RegistroClinicoRequestDTO {
    private Integer idTipoProcedimiento;
    private String descripcion;
}
