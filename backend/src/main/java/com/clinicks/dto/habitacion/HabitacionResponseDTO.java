package com.clinicks.dto.habitacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HabitacionResponseDTO {
    private Integer id;
    private String numeroHabitacion;
    private Integer pisoHabitacion;
    private String estadoHabitacion;
    private PacienteOcupanteDTO pacienteActual;
    private InternacionActualDTO internacionActual;

    @Data
    @Builder
    public static class PacienteOcupanteDTO {
        private Integer id;
        private String nombreCompleto;
        private Integer dni;
    }

    @Data
    @Builder
    public static class InternacionActualDTO {
        private Integer id;
        private String fechaInicio;
        private Integer cantidadTraslados;
    }
}
