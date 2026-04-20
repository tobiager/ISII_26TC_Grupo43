package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contacto_emergencia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactoEmergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contacto_emergencia")
    private Integer idContactoEmergencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(name = "parentesco", nullable = false, length = 50)
    private String parentesco;

    @Column(name = "telefono_celular", nullable = false, length = 25)
    private String telefonoCelular;
}
