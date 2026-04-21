package com.clinicks.repository;

import com.clinicks.model.HistorialMedico;
import com.clinicks.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Integer> {

    boolean existsByPaciente(Paciente paciente);
}
