package com.clinicks.repository;

import com.clinicks.model.HabitacionInternacion;
import com.clinicks.model.HistorialMedico;
import com.clinicks.model.Internacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternacionRepository extends JpaRepository<Internacion, Integer> {

    @Query("SELECT i FROM Internacion i WHERE i.habitacion = :hab AND i.fechaFin IS NULL")
    Optional<Internacion> encontrarActivaPorHabitacion(@Param("hab") HabitacionInternacion hab);

    @Query("SELECT i FROM Internacion i WHERE i.historial = :historial AND i.fechaFin IS NULL")
    Optional<Internacion> encontrarActivaPorHistorial(@Param("historial") HistorialMedico historial);

    @Query("SELECT i FROM Internacion i WHERE i.historial.paciente.idPaciente = :idPaciente AND i.fechaFin IS NULL")
    Optional<Internacion> encontrarActivaPorPaciente(@Param("idPaciente") Integer idPaciente);

    List<Internacion> findAllByHistorialOrderByFechaInicioDesc(HistorialMedico historial);
}
