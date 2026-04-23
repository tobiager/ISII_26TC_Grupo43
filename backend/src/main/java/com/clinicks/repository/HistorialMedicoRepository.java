package com.clinicks.repository;

import com.clinicks.model.HistorialMedico;
import com.clinicks.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM HistorialMedico h WHERE h.paciente = :paciente")
    boolean existePorPaciente(@org.springframework.data.repository.query.Param("paciente") com.clinicks.model.Paciente paciente);
}
