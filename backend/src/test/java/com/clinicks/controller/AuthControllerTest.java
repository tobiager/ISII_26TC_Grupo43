package com.clinicks.controller;

import com.clinicks.dto.auth.LoginResponseDTO;
import com.clinicks.exception.ManejadorGlobalDeExcepciones;
import com.clinicks.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Objects;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private AuthService authService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new ManejadorGlobalDeExcepciones())
                .setValidator(validator)
                .build();
    }

    @Test
    void login_exitoso_devuelve200YToken() throws Exception {
        LoginResponseDTO.UsuarioAuthDTO usuario = LoginResponseDTO.UsuarioAuthDTO.builder()
                .idUsuario(1)
                .email("juan.perez@clinicks.com")
                .nombre("Juan")
                .apellido("Perez")
                .nombreCompleto("Juan Perez")
                .iniciales("JP")
                .rol("MEDICO")
                .autorizacion("ACTIVO")
                .mustChangePassword(false)
                .esAdminProtegido(false)
                .build();

        LoginResponseDTO response = LoginResponseDTO.builder()
                .token("token-jwt")
                .usuario(usuario)
                .build();

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("juan.perez@clinicks.com", "Clave123!")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-jwt"))
                .andExpect(jsonPath("$.usuario.email").value("juan.perez@clinicks.com"));
    }

    @Test
    void login_conEmailYPasswordVacios_devuelveErroresDeValidacion() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("", "")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("El email es obligatorio"))
                .andExpect(jsonPath("$.campos.password").value("La contraseña es obligatoria"));
    }

    @Test
    void login_conEmailVacio_yPasswordValida_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("", "Clave123!")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("El email es obligatorio"));
    }

    @Test
    void login_conPasswordVacia_yEmailValido_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("juan.perez@clinicks.com", "")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.password").value("La contraseña es obligatoria"));
    }

    @Test
    void login_conEspaciosEnBlanco_devuelveErroresDeValidacion() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("   ", "   ")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("El email es obligatorio"))
                .andExpect(jsonPath("$.campos.password").value("La contraseña es obligatoria"));
    }

    @Test
    void login_conEmailConEspaciosLaterales_devuelveErrorDeFormato() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(loginJson("  juan.perez@clinicks.com  ", "Clave123!")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").value("El formato del email no es válido"));
    }

    private static LoginJson loginJson(String email, String password) {
        return new LoginJson(email, password);
    }

    private record LoginJson(String email, String password) {}
}