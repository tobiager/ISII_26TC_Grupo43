package com.clinicks.service.impl;

import com.clinicks.config.AdminConstants;
import com.clinicks.dto.perfil.CambiarDatosBasicosRequestDTO;
import com.clinicks.dto.perfil.CambiarEmailRequestDTO;
import com.clinicks.dto.perfil.CambiarPasswordRequestDTO;
import com.clinicks.dto.perfil.PerfilResponseDTO;
import com.clinicks.exception.CredencialesInvalidasException;
import com.clinicks.exception.OperacionNoPermitidaException;
import com.clinicks.exception.UsuarioDuplicadoException;
import com.clinicks.model.Usuario;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.service.PerfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PerfilServiceImpl implements PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PerfilResponseDTO obtenerPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmailActivo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertir(usuario);
    }

    @Override
    @Transactional
    public PerfilResponseDTO cambiarEmail(String emailActual, CambiarEmailRequestDTO request) {
        if (AdminConstants.EMAIL_ADMIN_PROTEGIDO.equals(emailActual)) {
            throw new OperacionNoPermitidaException("El email del administrador principal no puede modificarse.");
        }

        Usuario usuario = usuarioRepository.findByEmailActivo(emailActual)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPass())) {
            throw new CredencialesInvalidasException();
        }
        if (usuarioRepository.existsByEmail(request.getNuevoEmail())) {
            throw new UsuarioDuplicadoException(request.getNuevoEmail());
        }

        usuario.setEmail(request.getNuevoEmail());
        usuarioRepository.save(usuario);

        return convertir(usuario);
    }

    @Override
    @Transactional
    public PerfilResponseDTO cambiarPassword(String email, CambiarPasswordRequestDTO request) {
        if (AdminConstants.EMAIL_ADMIN_PROTEGIDO.equals(email)) {
            throw new OperacionNoPermitidaException("La contraseña del administrador principal no puede modificarse por este medio.");
        }

        Usuario usuario = usuarioRepository.findByEmailActivo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPass())) {
            throw new CredencialesInvalidasException();
        }

        usuario.setPass(passwordEncoder.encode(request.getNuevaPassword()));
        usuario.setMustChangePassword(false);
        usuarioRepository.save(usuario);

        return convertir(usuario);
    }

    @Override
    @Transactional
    public PerfilResponseDTO cambiarDatosBasicos(String email, CambiarDatosBasicosRequestDTO request) {
        if (AdminConstants.EMAIL_ADMIN_PROTEGIDO.equals(email)) {
            throw new OperacionNoPermitidaException("Los datos del administrador principal no pueden modificarse.");
        }

        Usuario usuario = usuarioRepository.findByEmailActivo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.getPersona().setNombrePersona(request.getNombre());
        usuario.getPersona().setApellidoPersona(request.getApellido());
        if (request.getFechaNacimiento() != null && !request.getFechaNacimiento().isBlank()) {
            usuario.getPersona().setFechaNacimiento(
                    LocalDateTime.parse(request.getFechaNacimiento() + "T00:00:00"));
        }
        usuarioRepository.save(usuario);

        return convertir(usuario);
    }

    private PerfilResponseDTO convertir(Usuario u) {
        return PerfilResponseDTO.builder()
                .idUsuario(u.getIdUsuario())
                .email(u.getEmail())
                .nombre(u.getPersona().getNombrePersona())
                .apellido(u.getPersona().getApellidoPersona())
                .rol(u.getRol().getNombreRol())
                .autorizacion(u.getAutorizacion())
                .mustChangePassword(u.isMustChangePassword())
                .esAdminProtegido(AdminConstants.EMAIL_ADMIN_PROTEGIDO.equals(u.getEmail()))
                .build();
    }
}
