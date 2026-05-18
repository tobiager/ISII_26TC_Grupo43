package com.clinicks.dto.historial;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegistroClinicoResponseDTO {
    private Integer id;
    private String descripcion;
    private String fechaRegistro;
    private Integer idTipoProcedimiento;
    private String tipoProcedimiento;
    private Integer idUsuario;
    private String usuarioNombre;
    private String usuarioRol;
}
