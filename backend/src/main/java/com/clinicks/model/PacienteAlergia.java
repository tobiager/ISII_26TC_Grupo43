package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "antecedente_medico")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteAlergia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_antecedente_medico")
    private Integer idAntecedenteMedico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ficha_medica", nullable = false)
    private FichaMedica fichaMedica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_alergia")
    private Alergia alergia;
}
