package com.clinicks.repository;

import com.clinicks.model.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProvinciaRepository extends JpaRepository<Provincia, Integer> {

    List<Provincia> findAllByOrderByNombreProvinciaAsc();
}
