package com.clinicks.repository;

import com.clinicks.model.Paciente;
import com.clinicks.model.Telefono;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelefonoRepository extends JpaRepository<Telefono, Integer> {

    List<Telefono> findByPaciente(Paciente paciente);

    Optional<Telefono> findByPacienteAndTipoTelefono(Paciente paciente, String tipoTelefono);

    @Modifying
    @Query("DELETE FROM Telefono t WHERE t.paciente = :paciente")
    void deleteAllByPaciente(@Param("paciente") Paciente paciente);
}
