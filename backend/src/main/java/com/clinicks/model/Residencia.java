package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "residencia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Residencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_residencia")
    private Integer idResidencia;

    @Column(name = "tipo_residencia", nullable = false, length = 15)
    private String tipoResidencia;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_direccion", nullable = false)
    private Domicilio domicilio;
}
