package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "internacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Internacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_internacion")
    private Integer id;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "cantidad_traslados", nullable = false)
    private Integer cantidadTraslados;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_historial", nullable = false)
    private HistorialMedico historial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_habitacion_internacion", nullable = false)
    private HabitacionInternacion habitacion;
}
