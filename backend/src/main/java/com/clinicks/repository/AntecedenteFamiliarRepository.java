package com.clinicks.repository;

import com.clinicks.model.AntecedenteFamiliar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AntecedenteFamiliarRepository extends JpaRepository<AntecedenteFamiliar, Integer> {

    Optional<AntecedenteFamiliar> findByNombreEnfermedadIgnoreCase(String nombre);
}
