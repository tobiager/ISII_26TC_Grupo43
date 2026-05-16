package com.clinicks.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipo_procedimiento")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoProcedimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_procedimiento")
    private Integer id;

    @Column(name = "nombre_tipo_procedimiento", nullable = false)
    private String nombreTipoProcedimiento;
}
