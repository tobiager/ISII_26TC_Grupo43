package com.clinicks.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class PacienteResponseDTO {

    private Integer id;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private Integer dni;
    private Integer edad;
    private LocalDate fechaNacimiento;

    private String tipoSangre;
    private List<String> alergias;
    private List<String> enfermedadesCronicas;
    private List<String> antecedentesFamiliares;

    private String obraSocial;
    private Integer idObraSocial;
    private String nroAfiliado;

    private String estado;
    private String numeroHabitacion;
    private LocalDate ultimaVisita;

    private String telefono;
    private String direccion;

    private Integer idLocalidad;
    private String nombreLocalidad;
    private Integer idProvincia;
    private String nombreProvincia;

    private String contactoEmergenciaNombre;
    private String contactoEmergenciaTelefono;
    private String contactoEmergenciaParentesco;
}
