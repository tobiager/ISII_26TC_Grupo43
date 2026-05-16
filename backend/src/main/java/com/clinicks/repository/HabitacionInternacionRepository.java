package com.clinicks.repository;

import com.clinicks.model.HabitacionInternacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitacionInternacionRepository extends JpaRepository<HabitacionInternacion, Integer> {
    List<HabitacionInternacion> findAllByOrderByPisoHabitacionAscNumeroHabitacionAsc();
}
