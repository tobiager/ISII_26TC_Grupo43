package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "telefono")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Telefono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_telefono")
    private Integer idTelefono;

    @Column(name = "numero_telefono", nullable = false, unique = true, length = 20)
    private String numeroTelefono;

    @Column(name = "tipo_telefono", nullable = false, length = 15)
    private String tipoTelefono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;
}
