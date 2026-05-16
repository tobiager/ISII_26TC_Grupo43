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

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Telefono t WHERE t.paciente = :paciente")
    List<Telefono> encontrarPorPaciente(@org.springframework.data.repository.query.Param("paciente") Paciente paciente);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Telefono t WHERE t.paciente = :paciente AND t.tipoTelefono = :tipoTelefono")
    Optional<Telefono> encontrarPorPacienteYTipo(@org.springframework.data.repository.query.Param("paciente") Paciente paciente, @org.springframework.data.repository.query.Param("tipoTelefono") String tipoTelefono);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Telefono t WHERE t.paciente = :paciente")
    void eliminarTodosPorPaciente(@Param("paciente") Paciente paciente);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Telefono t WHERE t.numeroTelefono = :numero")
    boolean existePorNumero(@Param("numero") String numero);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Telefono t WHERE t.numeroTelefono = :numero AND t.paciente.idPaciente != :idPaciente")
    boolean existePorNumeroEnOtroPaciente(@Param("numero") String numero, @Param("idPaciente") Integer idPaciente);
}
