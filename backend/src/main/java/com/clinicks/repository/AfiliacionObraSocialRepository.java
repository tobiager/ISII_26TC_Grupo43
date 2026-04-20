package com.clinicks.repository;

import com.clinicks.model.AfiliacionObraSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AfiliacionObraSocialRepository extends JpaRepository<AfiliacionObraSocial, Integer> {
    Optional<AfiliacionObraSocial> findByNumeroAfiliado(String numeroAfiliado);
}
