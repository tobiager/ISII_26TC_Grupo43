package com.clinicks.repository;

import com.clinicks.model.Localidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalidadRepository extends JpaRepository<Localidad, Integer> {

    List<Localidad> findByProvinciaIdProvinciaOrderByNombreLocalidadAsc(Integer idProvincia);

    List<Localidad> findAllByOrderByNombreLocalidadAsc();
}
