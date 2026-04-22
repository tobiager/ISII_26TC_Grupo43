package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "persona")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Integer idPersona;

    @Column(name = "nombre_persona", nullable = false, length = 200)
    private String nombrePersona;

    @Column(name = "apellido_persona", nullable = false, length = 200)
    private String apellidoPersona;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDateTime fechaNacimiento;

    @Column(name = "fecha_fallecimiento")
    private LocalDateTime fechaFallecimiento;
}
