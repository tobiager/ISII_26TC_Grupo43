package com.clinicks.repository;

import com.clinicks.model.ObraSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT o FROM ObraSocial o WHERE LOWER(o.nombreObra) = LOWER(:nombreObra)")
    Optional<ObraSocial> encontrarPorNombreIgnorandoMayusculas(@org.springframework.data.repository.query.Param("nombreObra") String nombreObra);
}
