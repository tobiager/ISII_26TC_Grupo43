package com.clinicks.dto.habitacion;

import lombok.Data;

@Data
public class TrasladoRequestDTO {
    private Integer idHabitacionDestino;
    private String motivo;
    private String observaciones;
}
