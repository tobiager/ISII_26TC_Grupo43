package com.clinicks.repository;

import com.clinicks.model.InvitacionRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitacionRegistroRepository extends JpaRepository<InvitacionRegistro, Integer> {

    Optional<InvitacionRegistro> findByToken(String token);

    @Query("SELECT i FROM InvitacionRegistro i WHERE i.deletedAt IS NULL ORDER BY i.fechaCreacion DESC")
    List<InvitacionRegistro> findAllActivas();

    @Query("SELECT i FROM InvitacionRegistro i WHERE i.email = :email AND i.fechaUso IS NULL AND i.deletedAt IS NULL AND i.fechaExpiracion > CURRENT_TIMESTAMP")
    List<InvitacionRegistro> findInvitacionesPendientesPorEmail(@Param("email") String email);
}
