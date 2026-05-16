package com.clinicks.repository;

import com.clinicks.model.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProvinciaRepository extends JpaRepository<Provincia, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Provincia p ORDER BY p.nombreProvincia ASC")
    List<Provincia> encontrarTodasOrdenadasPorNombre();
}
