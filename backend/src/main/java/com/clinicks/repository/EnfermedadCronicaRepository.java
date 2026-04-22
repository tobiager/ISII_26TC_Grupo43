package com.clinicks.repository;

import com.clinicks.model.EnfermedadCronica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnfermedadCronicaRepository extends JpaRepository<EnfermedadCronica, Integer> {

    Optional<EnfermedadCronica> findByNombreEnfermedadIgnoreCase(String nombre);
}
