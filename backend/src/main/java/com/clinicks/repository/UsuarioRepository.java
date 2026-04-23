package com.clinicks.repository;

import com.clinicks.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE u.idUsuario = :id AND u.deletedAt IS NULL")
    Optional<Usuario> encontrarPorIdUsuarioActivo(@org.springframework.data.repository.query.Param("id") Integer id);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM usuario WHERE deleted_at IS NULL ORDER BY id_usuario ASC LIMIT 1", nativeQuery = true)
    Optional<Usuario> encontrarPrimerUsuarioActivo();
}
