package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "antecedente_familiar")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntecedenteFamiliar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_antecedente_familiar")
    private Integer idAntecedenteFamiliar;

    @Column(name = "nombre_enfermedad", nullable = false, length = 200)
    private String nombreEnfermedad;
}
