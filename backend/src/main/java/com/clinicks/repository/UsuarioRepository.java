package com.clinicks.repository;

import com.clinicks.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query("SELECT u FROM Usuario u WHERE u.idUsuario = :id AND u.deletedAt IS NULL")
    Optional<Usuario> encontrarPorIdUsuarioActivo(@Param("id") Integer id);

    @Query(value = "SELECT * FROM usuario WHERE deleted_at IS NULL ORDER BY id_usuario ASC LIMIT 1", nativeQuery = true)
    Optional<Usuario> encontrarPrimerUsuarioActivo();

    Optional<Usuario> findByEmail(String email);

    @Query("SELECT u FROM Usuario u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<Usuario> findByEmailActivo(@Param("email") String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM Usuario u ORDER BY u.idUsuario ASC")
    List<Usuario> findAllOrderById();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol.nombreRol = 'ADMINISTRADOR' AND u.deletedAt IS NULL")
    long contarAdministradoresActivos();
}
