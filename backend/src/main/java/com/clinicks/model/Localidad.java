package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "localidad")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Localidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_localidad")
    private Integer idLocalidad;

    @Column(name = "nombre_localidad", nullable = false, length = 200)
    private String nombreLocalidad;

    @Column(name = "codigo_postal", nullable = false)
    private Integer codigoPostal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_provincia", nullable = false)
    private Provincia provincia;
}
