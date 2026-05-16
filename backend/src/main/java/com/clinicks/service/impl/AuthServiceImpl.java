package com.clinicks.service.impl;

import com.clinicks.config.AdminConstants;
import com.clinicks.dto.auth.*;
import com.clinicks.exception.*;
import com.clinicks.model.InvitacionRegistro;
import com.clinicks.model.Persona;
import com.clinicks.model.Rol;
import com.clinicks.model.Usuario;
import com.clinicks.repository.InvitacionRegistroRepository;
import com.clinicks.repository.PersonaRepository;
import com.clinicks.repository.RolRepository;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.security.JwtUtil;
import com.clinicks.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final RolRepository rolRepository;
    private final InvitacionRegistroRepository invitacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmailActivo(request.getEmail())
                .orElseThrow(CredencialesInvalidasException::new);

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPass())) {
            throw new CredencialesInvalidasException();
        }

        String token = jwtUtil.generarToken(
                usuario.getIdUsuario(),
                usuario.getEmail(),
                usuario.getRol().getNombreRol()
        );

        return LoginResponseDTO.builder()
                .token(token)
                .usuario(convertirAUsuarioAuthDTO(usuario))
                .build();
    }

    @Override
    @Transactional
    public LoginResponseDTO register(RegisterRequestDTO request) {
        InvitacionRegistro invitacion = invitacionRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvitacionInvalidaException("El token de invitación no es válido."));

        if (invitacion.getDeletedAt() != null) {
            throw new InvitacionInvalidaException("La invitación ha sido cancelada.");
        }
        if (invitacion.getFechaUso() != null) {
            throw new InvitacionInvalidaException("La invitación ya fue utilizada.");
        }
        if (invitacion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new InvitacionInvalidaException("La invitación ha expirado.");
        }
        if (usuarioRepository.existsByEmail(invitacion.getEmail())) {
            throw new UsuarioDuplicadoException(invitacion.getEmail());
        }

        Persona persona = Persona.builder()
                .nombrePersona(request.getNombre())
                .apellidoPersona(request.getApellido())
                .fechaNacimiento(LocalDateTime.parse(request.getFechaNacimiento() + "T00:00:00"))
                .build();
        personaRepository.save(persona);

        Usuario usuario = Usuario.builder()
                .email(invitacion.getEmail())
                .pass(passwordEncoder.encode(request.getPassword()))
                .autorizacion("ACTIVO")
                .rol(invitacion.getRol())
                .persona(persona)
                .build();
        usuarioRepository.save(usuario);

        invitacion.setFechaUso(LocalDateTime.now());
        invitacionRepository.save(invitacion);

        String token = jwtUtil.generarToken(
                usuario.getIdUsuario(),
                usuario.getEmail(),
                usuario.getRol().getNombreRol()
        );

        return LoginResponseDTO.builder()
                .token(token)
                .usuario(convertirAUsuarioAuthDTO(usuario))
                .build();
    }

    @Override
    public LoginResponseDTO.UsuarioAuthDTO me(String email) {
        Usuario usuario = usuarioRepository.findByEmailActivo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertirAUsuarioAuthDTO(usuario);
    }

    @Override
    @Transactional
    public InvitacionResponseDTO crearInvitacion(InvitacionRequestDTO request, String emailCreador) {
        if (AdminConstants.ROL_ADMINISTRADOR.equals(request.getRol())) {
            throw new OperacionNoPermitidaException("No se puede invitar con el rol ADMINISTRADOR.");
        }

        Rol rol = rolRepository.findByNombreRol(request.getRol())
                .orElseThrow(() -> new RolNoEncontradoException(request.getRol()));

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new UsuarioDuplicadoException(request.getEmail());
        }

        LocalDateTime expiracion = (request.getFechaExpiracion() != null && !request.getFechaExpiracion().isBlank())
                ? LocalDateTime.parse(request.getFechaExpiracion())
                : LocalDateTime.now().plusDays(7);

        Usuario creador = usuarioRepository.findByEmailActivo(emailCreador)
                .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado"));

        String token = UUID.randomUUID().toString();

        InvitacionRegistro invitacion = InvitacionRegistro.builder()
                .email(request.getEmail())
                .token(token)
                .rol(rol)
                .usuarioCreador(creador)
                .fechaCreacion(LocalDateTime.now())
                .fechaExpiracion(expiracion)
                .build();

        invitacionRepository.save(invitacion);

        String link = frontendUrl + "/register?token=" + token;

        return convertirAInvitacionDTO(invitacion, link);
    }

    @Override
    public List<InvitacionResponseDTO> listarInvitaciones() {
        return invitacionRepository.findAllActivas().stream()
                .map(i -> convertirAInvitacionDTO(i, frontendUrl + "/register?token=" + i.getToken()))
                .collect(Collectors.toList());
    }

    @Override
    public ValidarTokenResponseDTO validarToken(String token) {
        InvitacionRegistro invitacion = invitacionRepository.findByToken(token)
                .orElseThrow(() -> new InvitacionInvalidaException("Token inválido."));

        if (invitacion.getDeletedAt() != null) {
            throw new InvitacionInvalidaException("La invitación ha sido cancelada.");
        }
        if (invitacion.getFechaUso() != null) {
            throw new InvitacionInvalidaException("La invitación ya fue utilizada.");
        }
        if (invitacion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new InvitacionInvalidaException("La invitación ha expirado.");
        }

        return ValidarTokenResponseDTO.builder()
                .email(invitacion.getEmail())
                .rol(invitacion.getRol().getNombreRol())
                .build();
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────

    private LoginResponseDTO.UsuarioAuthDTO convertirAUsuarioAuthDTO(Usuario u) {
        String nombre = u.getPersona().getNombrePersona();
        String apellido = u.getPersona().getApellidoPersona();
        String iniciales = (String.valueOf(nombre.charAt(0)) + String.valueOf(apellido.charAt(0))).toUpperCase();
        return LoginResponseDTO.UsuarioAuthDTO.builder()
                .idUsuario(u.getIdUsuario())
                .email(u.getEmail())
                .nombre(nombre)
                .apellido(apellido)
                .nombreCompleto(nombre + " " + apellido)
                .iniciales(iniciales)
                .rol(u.getRol().getNombreRol())
                .autorizacion(u.getAutorizacion())
                .mustChangePassword(u.isMustChangePassword())
                .esAdminProtegido("admin@clinicks.com".equals(u.getEmail()))
                .build();
    }

    private InvitacionResponseDTO convertirAInvitacionDTO(InvitacionRegistro i, String link) {
        boolean vencida = i.getFechaExpiracion().isBefore(LocalDateTime.now());
        return InvitacionResponseDTO.builder()
                .idInvitacion(i.getIdInvitacion())
                .email(i.getEmail())
                .rol(i.getRol().getNombreRol())
                .invitationLink(link)
                .fechaCreacion(i.getFechaCreacion())
                .fechaExpiracion(i.getFechaExpiracion())
                .fechaUso(i.getFechaUso())
                .usada(i.getFechaUso() != null)
                .vencida(vencida)
                .build();
    }
}
