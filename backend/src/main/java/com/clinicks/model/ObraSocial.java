package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "obra_social")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObraSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_obra_social")
    private Integer idObraSocial;

    @Column(name = "nombre_obra", nullable = false, length = 100)
    private String nombreObra;
}
