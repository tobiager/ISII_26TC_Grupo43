package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enfermedad_cronica")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnfermedadCronica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_enfermedad_cronica")
    private Integer idEnfermedadCronica;

    @Column(name = "nombre_enfermedad", nullable = false, length = 200)
    private String nombreEnfermedad;
}
