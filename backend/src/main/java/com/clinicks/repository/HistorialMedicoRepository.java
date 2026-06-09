package com.clinicks.repository;

import com.clinicks.model.HistorialMedico;
import com.clinicks.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Integer> {

    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM HistorialMedico h WHERE h.paciente = :paciente")
    boolean existePorPaciente(@Param("paciente") Paciente paciente);

    @Query("SELECT h FROM HistorialMedico h WHERE h.paciente.idPaciente = :idPaciente ORDER BY h.fechaCreacion DESC")
    Optional<HistorialMedico> encontrarPorIdPaciente(@Param("idPaciente") Integer idPaciente);
}
