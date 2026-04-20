package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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

    @Column(name = "antecedentes_familiares_text", columnDefinition = "TEXT")
    private String antecedentesText;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "ficha_alergia",
        joinColumns = @JoinColumn(name = "id_ficha_medica"),
        inverseJoinColumns = @JoinColumn(name = "id_alergia")
    )
    @Builder.Default
    private Set<Alergia> alergias = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "ficha_enfermedad_cronica",
        joinColumns = @JoinColumn(name = "id_ficha_medica"),
        inverseJoinColumns = @JoinColumn(name = "id_enfermedad_cronica")
    )
    @Builder.Default
    private Set<EnfermedadCronica> enfermedadesCronicas = new HashSet<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "ficha_antecedente_familiar",
        joinColumns = @JoinColumn(name = "id_ficha_medica"),
        inverseJoinColumns = @JoinColumn(name = "id_antecedente_familiar")
    )
    @Builder.Default
    private Set<AntecedenteFamiliar> antecedentesFamiliares = new HashSet<>();
}
