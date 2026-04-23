package com.clinicks.repository;

import com.clinicks.model.AntecedenteFamiliar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AntecedenteFamiliarRepository extends JpaRepository<AntecedenteFamiliar, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AntecedenteFamiliar a WHERE LOWER(a.nombreEnfermedad) = LOWER(:nombre)")
    Optional<AntecedenteFamiliar> encontrarPorNombreIgnorandoMayusculas(@org.springframework.data.repository.query.Param("nombre") String nombre);
}
