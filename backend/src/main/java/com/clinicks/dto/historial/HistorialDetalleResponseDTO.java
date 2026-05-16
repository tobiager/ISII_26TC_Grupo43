package com.clinicks.dto.historial;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HistorialDetalleResponseDTO {
    private Integer id;
    private String fechaCreacion;
    private String fechaActualizacion;
    private String observaciones;
    private String estadoHistorial;
    private List<RegistroClinicoResponseDTO> registros;
}
