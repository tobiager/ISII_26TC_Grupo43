package com.clinicks.repository;

import com.clinicks.model.TipoProcedimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoProcedimientoRepository extends JpaRepository<TipoProcedimiento, Integer> {

    java.util.Optional<TipoProcedimiento> findByNombreTipoProcedimiento(String nombre);
}
