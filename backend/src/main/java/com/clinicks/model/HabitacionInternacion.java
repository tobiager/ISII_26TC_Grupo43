package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "habitacion_internacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitacionInternacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_habitacion_internacion")
    private Integer id;

    @Column(name = "numero_habitacion", nullable = false, length = 4)
    private String numeroHabitacion;

    @Column(name = "piso_habitacion", nullable = false)
    private Integer pisoHabitacion;

    @Column(name = "estado_habitacion", nullable = false, length = 15)
    private String estadoHabitacion;
}
