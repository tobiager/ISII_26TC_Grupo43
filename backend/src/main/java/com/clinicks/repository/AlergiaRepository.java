package com.clinicks.repository;

import com.clinicks.model.Alergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Alergia a WHERE LOWER(a.nombreAlergia) = LOWER(:nombreAlergia)")
    Optional<Alergia> encontrarPorNombreIgnorandoMayusculas(@org.springframework.data.repository.query.Param("nombreAlergia") String nombreAlergia);
}
