package com.clinicks.repository;

import com.clinicks.model.FichaMedica;
import com.clinicks.model.PacienteAlergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacienteAlergiaRepository extends JpaRepository<PacienteAlergia, Integer> {

    List<PacienteAlergia> findByFichaMedica(FichaMedica fichaMedica);

    @Modifying
    @Query("DELETE FROM PacienteAlergia pa WHERE pa.fichaMedica = :ficha")
    void deleteAllByFichaMedica(@Param("ficha") FichaMedica fichaMedica);
}
