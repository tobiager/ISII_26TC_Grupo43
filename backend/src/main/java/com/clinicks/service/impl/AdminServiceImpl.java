package com.clinicks.service.impl;

import com.clinicks.dto.admin.AdminUsuarioDTO;
import com.clinicks.dto.admin.CambiarRolRequestDTO;
import com.clinicks.exception.RolNoEncontradoException;
import com.clinicks.exception.UsuarioNoEncontradoException;
import com.clinicks.model.Rol;
import com.clinicks.model.Usuario;
import com.clinicks.repository.RolRepository;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Override
    public List<AdminUsuarioDTO> listarUsuarios() {
        return usuarioRepository.findAllOrderById().stream()
                .map(this::convertirAAdminUsuarioDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdminUsuarioDTO cambiarRol(Integer idUsuario, CambiarRolRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));

        Rol nuevoRol = rolRepository.findByNombreRol(request.getRol())
                .orElseThrow(() -> new RolNoEncontradoException(request.getRol()));

        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);

        return convertirAAdminUsuarioDTO(usuario);
    }

    @Override
    @Transactional
    public AdminUsuarioDTO desactivarUsuario(Integer idUsuario, String emailSolicitante) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));

        // No permitir que el último administrador activo se desactive
        if ("ADMINISTRADOR".equals(usuario.getRol().getNombreRol())) {
            long totalAdmin = usuarioRepository.contarAdministradoresActivos();
            if (totalAdmin <= 1) {
                throw new RuntimeException(
                        "No se puede desactivar al último administrador activo del sistema.");
            }
        }

        usuario.setDeletedAt(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        return convertirAAdminUsuarioDTO(usuario);
    }

    @Override
    @Transactional
    public AdminUsuarioDTO activarUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNoEncontradoException(idUsuario));

        usuario.setDeletedAt(null);
        usuarioRepository.save(usuario);

        return convertirAAdminUsuarioDTO(usuario);
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────

    private AdminUsuarioDTO convertirAAdminUsuarioDTO(Usuario u) {
        String nombre = u.getPersona().getNombrePersona();
        String apellido = u.getPersona().getApellidoPersona();
        String iniciales = (String.valueOf(nombre.charAt(0)) + String.valueOf(apellido.charAt(0))).toUpperCase();
        return AdminUsuarioDTO.builder()
                .idUsuario(u.getIdUsuario())
                .email(u.getEmail())
                .nombre(nombre)
                .apellido(apellido)
                .nombreCompleto(nombre + " " + apellido)
                .iniciales(iniciales)
                .rol(u.getRol().getNombreRol())
                .autorizacion(u.getAutorizacion())
                .activo(u.getDeletedAt() == null)
                .build();
    }
}
