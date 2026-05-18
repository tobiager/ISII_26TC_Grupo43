package com.clinicks.dto.historial;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TipoProcedimientoDTO {
    private Integer id;
    private String nombre;
}
