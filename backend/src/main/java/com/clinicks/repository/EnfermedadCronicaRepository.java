package com.clinicks.repository;

import com.clinicks.model.EnfermedadCronica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnfermedadCronicaRepository extends JpaRepository<EnfermedadCronica, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EnfermedadCronica e WHERE LOWER(e.nombreEnfermedad) = LOWER(:nombre)")
    Optional<EnfermedadCronica> encontrarPorNombreIgnorandoMayusculas(@org.springframework.data.repository.query.Param("nombre") String nombre);
}
