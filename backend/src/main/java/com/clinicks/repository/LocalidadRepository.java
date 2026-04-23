package com.clinicks.repository;

import com.clinicks.model.Localidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalidadRepository extends JpaRepository<Localidad, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT l FROM Localidad l WHERE l.provincia.idProvincia = :idProvincia ORDER BY l.nombreLocalidad ASC")
    List<Localidad> encontrarPorProvinciaOrdenadasPorNombre(@org.springframework.data.repository.query.Param("idProvincia") Integer idProvincia);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM Localidad l ORDER BY l.nombreLocalidad ASC")
    List<Localidad> encontrarTodasOrdenadasPorNombre();
}
