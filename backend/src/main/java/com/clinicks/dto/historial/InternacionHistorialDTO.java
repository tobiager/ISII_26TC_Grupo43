package com.clinicks.dto.historial;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InternacionHistorialDTO {
    private Integer idInternacion;
    private String  fechaInicio;
    private String  fechaFin;
    private String  estado;
    private String  numeroHabitacion;
    private Integer pisoHabitacion;
    private Integer cantidadTraslados;
    private List<RegistroClinicoResponseDTO> eventos;
}
