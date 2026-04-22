package com.clinicks.repository;

import com.clinicks.model.ObraSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {

    Optional<ObraSocial> findByNombreObraIgnoreCase(String nombreObra);
}
