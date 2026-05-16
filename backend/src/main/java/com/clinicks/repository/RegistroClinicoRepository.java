package com.clinicks.repository;

import com.clinicks.model.HistorialMedico;
import com.clinicks.model.RegistroClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroClinicoRepository extends JpaRepository<RegistroClinico, Integer> {
    List<RegistroClinico> findAllByHistorialOrderByFechaRegistroDesc(HistorialMedico historial);
}
