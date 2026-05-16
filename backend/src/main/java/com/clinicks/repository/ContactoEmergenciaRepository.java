package com.clinicks.repository;

import com.clinicks.model.ContactoEmergencia;
import com.clinicks.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergencia, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT c FROM ContactoEmergencia c WHERE c.paciente = :paciente")
    List<ContactoEmergencia> encontrarPorPaciente(@org.springframework.data.repository.query.Param("paciente") Paciente paciente);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ContactoEmergencia c WHERE c.paciente = :paciente")
    void eliminarTodosPorPaciente(@Param("paciente") Paciente paciente);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM ContactoEmergencia c WHERE c.telefonoCelular = :telefono")
    boolean existePorTelefono(@Param("telefono") String telefono);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM ContactoEmergencia c WHERE c.telefonoCelular = :telefono AND c.paciente.idPaciente != :idPaciente")
    boolean existePorTelefonoEnOtroPaciente(@Param("telefono") String telefono, @Param("idPaciente") Integer idPaciente);
}
