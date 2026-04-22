package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alergia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alergia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alergia")
    private Integer idAlergia;

    @Column(name = "nombre_alergia", nullable = false, unique = true, length = 100)
    private String nombreAlergia;
}
