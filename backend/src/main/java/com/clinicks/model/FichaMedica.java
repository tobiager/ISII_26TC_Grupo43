package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ficha_medica")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FichaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ficha_medica")
    private Integer idFichaMedica;

    @Column(name = "tipo_sangre", nullable = false, length = 3)
    private String tipoSangre;

    // Texto libre de antecedentes (antes era antecedente_familiar + enfermedades_cronicas)
    @Column(name = "antecedentes_familiares_text", columnDefinition = "TEXT")
    private String antecedentesText;
}
