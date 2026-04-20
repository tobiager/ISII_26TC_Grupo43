package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "afiliacion_obra_social")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AfiliacionObraSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_afiliacion")
    private Integer idAfiliacion;

    @Column(name = "numero_afiliado", nullable = false, unique = true, length = 50)
    private String numeroAfiliado;

    @Column(name = "fecha_alta")
    private LocalDate fechaAlta;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_baja")
    private LocalDate fechaBaja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_obra_social", nullable = false)
    private ObraSocial obraSocial;
}
