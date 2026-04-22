package com.clinicks.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class PacienteRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 200, message = "El apellido no puede superar 200 caracteres")
    private String apellido;

    @NotNull(message = "El DNI es obligatorio")
    @Positive(message = "El DNI debe ser un número positivo")
    private Integer dni;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento no puede ser futura")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Tipo de sangre inválido. Valores: A+, A-, B+, B-, AB+, AB-, O+, O-")
    private String tipoSangre;

    private List<String> alergias = new ArrayList<>();
    private List<String> enfermedadesCronicas = new ArrayList<>();
    private List<String> antecedentesFamiliares = new ArrayList<>();
    private String antecedentesText;

    private String telefono;

    @Pattern(regexp = "^(personal|emergencia)$", message = "El tipo de teléfono debe ser 'personal' o 'emergencia'")
    private String tipoTelefono;

    private String direccion;
    private Integer numeroDireccion;
    private Integer piso;
    private Integer idLocalidad;

    @Pattern(regexp = "^(permanente|transitorio)$", message = "El tipo de residencia debe ser 'permanente' o 'transitorio'")
    private String tipoResidencia;

    @Valid
    private List<ContactoEmergenciaDTO> contactosEmergencia = new ArrayList<>();

    private Integer idObraSocial;
    private String nombreObraSocial;
    private String nroAfiliado;
    private LocalDate fechaVencimientoAfiliacion;
}
