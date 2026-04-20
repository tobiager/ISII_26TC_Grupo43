package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "domicilio")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Domicilio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Integer idDireccion;

    // Almacena la dirección completa como texto libre (Ej: "Av. Corrientes 1234, CABA")
    @Column(name = "calle", nullable = false, length = 200)
    private String calle;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "piso")
    private Integer piso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_localidad", nullable = false)
    private Localidad localidad;
}
