package com.clinicks.dto.habitacion;

import lombok.Data;

@Data
public class InternacionRequestDTO {
    private Integer idPaciente;
    private String motivo;
    private String observaciones;
}
