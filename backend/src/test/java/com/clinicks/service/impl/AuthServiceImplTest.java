package com.clinicks.service.impl;

import com.clinicks.dto.auth.LoginRequestDTO;
import com.clinicks.dto.auth.LoginResponseDTO;
import com.clinicks.exception.CredencialesInvalidasException;
import com.clinicks.model.Persona;
import com.clinicks.model.Rol;
import com.clinicks.model.Usuario;
import com.clinicks.repository.InvitacionRegistroRepository;
import com.clinicks.repository.PersonaRepository;
import com.clinicks.repository.RolRepository;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PersonaRepository personaRepository;
    @Mock private RolRepository rolRepository;
    @Mock private InvitacionRegistroRepository invitacionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        Persona persona = Persona.builder()
                .idPersona(10)
                .nombrePersona("Juan")
                .apellidoPersona("Perez")
                .fechaNacimiento(LocalDateTime.of(1990, 5, 15, 0, 0))
                .build();

        Rol rol = Rol.builder()
                .idRol(2)
                .nombreRol("MEDICO")
                .build();

        usuario = Usuario.builder()
                .idUsuario(1)
                .email("juan.perez@clinicks.com")
                .pass("hash-seguro")
                .autorizacion("ACTIVO")
                .rol(rol)
                .persona(persona)
                .build();
    }

    @Test
    void login_exitoso_devuelveTokenYUsuario() {
        when(usuarioRepository.findByEmailActivo("juan.perez@clinicks.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Clave123!", "hash-seguro")).thenReturn(true);
        when(jwtUtil.generarToken(1, "juan.perez@clinicks.com", "MEDICO")).thenReturn("token-jwt");

        LoginRequestDTO request = new LoginRequestDTO();
        request.setEmail("juan.perez@clinicks.com");
        request.setPassword("Clave123!");

        LoginResponseDTO response = service.login(request);

        assertThat(response.getToken()).isEqualTo("token-jwt");
        assertThat(response.getUsuario().getEmail()).isEqualTo("juan.perez@clinicks.com");
        assertThat(response.getUsuario().getNombreCompleto()).isEqualTo("Juan Perez");
        assertThat(response.getUsuario().getIniciales()).isEqualTo("JP");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("credencialesInvalidas")
    void login_conCredencialesInvalidas_lanzaCredencialesInvalidasException(
            String descripcion,
            String email,
            String password,
            boolean usuarioExiste,
            boolean passwordValida) {

        if (usuarioExiste) {
            when(usuarioRepository.findByEmailActivo(email)).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches(password, usuario.getPass())).thenReturn(passwordValida);
        } else {
            when(usuarioRepository.findByEmailActivo(email)).thenReturn(Optional.empty());
        }

        LoginRequestDTO request = new LoginRequestDTO();
        request.setEmail(email);
        request.setPassword(password);

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessage("Credenciales inválidas. Verifique su email y contraseña.");
    }

    private static Stream<Arguments> credencialesInvalidas() {
        String emailLargo = "usuario." + "a".repeat(140) + "@example.com";
        return Stream.of(
                Arguments.of("email inexistente y password válida", "inexistente@clinicks.com", "Clave123!", false, false),
                Arguments.of("email válido y password inválida", "juan.perez@clinicks.com", "ClaveIncorrecta", true, false),
                Arguments.of("email y password inválidos", "otro@clinicks.com", "123456", false, false),
                Arguments.of("password con espacios", "juan.perez@clinicks.com", " Clave123! ", true, false),
                Arguments.of("credenciales largas", emailLargo, "ClaveMuyLarga1234567890!".repeat(8), false, false),
                Arguments.of("password con caracteres especiales", "juan.perez@clinicks.com", "' OR '1'='1", true, false)
        );
    }
}