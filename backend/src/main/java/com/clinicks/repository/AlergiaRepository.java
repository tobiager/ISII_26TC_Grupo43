package com.clinicks.repository;

import com.clinicks.model.Alergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Integer> {

    Optional<Alergia> findByNombreAlergiaIgnoreCase(String nombreAlergia);
}
