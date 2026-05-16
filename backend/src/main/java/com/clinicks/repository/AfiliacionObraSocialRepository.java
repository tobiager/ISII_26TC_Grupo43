package com.clinicks.repository;

import com.clinicks.model.AfiliacionObraSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AfiliacionObraSocialRepository extends JpaRepository<AfiliacionObraSocial, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AfiliacionObraSocial a WHERE a.numeroAfiliado = :numeroAfiliado AND a.obraSocial = :obraSocial")
    Optional<AfiliacionObraSocial> encontrarPorNumeroAfiliadoYObraSocial(@org.springframework.data.repository.query.Param("numeroAfiliado") String numeroAfiliado, @org.springframework.data.repository.query.Param("obraSocial") com.clinicks.model.ObraSocial obraSocial);
}
