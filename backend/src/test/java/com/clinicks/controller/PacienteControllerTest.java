package com.clinicks.controller;

import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.exception.ManejadorGlobalDeExcepciones;
import com.clinicks.model.Usuario;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.service.PacienteService;
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

import java.util.Objects;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PacienteControllerTest {

    @Mock
    private PacienteService pacienteService;

    @Mock
    private UsuarioRepository usuarioRepository;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new PacienteController(pacienteService, usuarioRepository))
                .setControllerAdvice(new ManejadorGlobalDeExcepciones())
                .setValidator(validator)
                .build();
    }

    @Test
    void crearPaciente_exitoso_devuelve201() throws Exception {
        PacienteResponseDTO response = PacienteResponseDTO.builder()
                .id(1)
                .nombre("Juan")
                .apellido("Perez")
                .dni(12345678)
                .tipoSangre("A+")
                .estado("Ambulatorio")
                .build();

        Usuario mockUsuario = mock(Usuario.class);
        when(mockUsuario.getIdUsuario()).thenReturn(1);
        when(usuarioRepository.findByEmailActivo(anyString())).thenReturn(Optional.of(mockUsuario));
        when(pacienteService.crearPaciente(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/pacientes")
                        .with(user("admin@clinicks.com"))
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                "Juan",
                                "Perez",
                                12345678,
                                "1990-05-15",
                                "A+",
                                "1123456789",
                                "personal",
                                "Corrientes",
                                1234,
                                3,
                                1,
                                "permanente"
                        )))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dni").value(12345678))
                .andExpect(jsonPath("$.nombre").value("Juan"));
    }

    @Test
    void crearPaciente_sinCamposObligatorios_devuelveErroresDeValidacion() throws Exception {
        mockMvc.perform(post("/api/pacientes")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nombre").value("El nombre es obligatorio"))
                .andExpect(jsonPath("$.campos.apellido").value("El apellido es obligatorio"))
                .andExpect(jsonPath("$.campos.dni").value("El DNI es obligatorio"))
                .andExpect(jsonPath("$.campos.fechaNacimiento").value("La fecha de nacimiento es obligatoria"))
                .andExpect(jsonPath("$.campos.tipoSangre").value("El tipo de sangre es obligatorio"));
    }

    @Test
    void crearPaciente_conFechaNacimientoFutura_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/pacientes")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                "Juan",
                                "Perez",
                                12345678,
                                java.time.LocalDate.now().plusDays(1).toString(),
                                "A+",
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.fechaNacimiento").value("La fecha de nacimiento no puede ser posterior a hoy"));
    }

    @Test
    void crearPaciente_conTipoSangreInvalido_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/pacientes")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                "Juan",
                                "Perez",
                                12345678,
                                "1990-05-15",
                                "X+",
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.tipoSangre").value("Tipo de sangre inválido. Valores: A+, A-, B+, B-, AB+, AB-, O+, O-"));
    }

    @Test
    void crearPaciente_conTipoTelefonoInvalido_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/pacientes")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                "Juan",
                                "Perez",
                                12345678,
                                "1990-05-15",
                                "A+",
                                "1123456789",
                                "hogar",
                                null,
                                null,
                                null,
                                null,
                                null
                        )))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.tipoTelefono").value("El tipo de teléfono debe ser 'personal' o 'emergencia'"));
    }

    @Test
    void crearPaciente_conTipoResidenciaInvalido_devuelveErrorDeValidacion() throws Exception {
        mockMvc.perform(post("/api/pacientes")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(new PacienteJson(
                                "Juan",
                                "Perez",
                                12345678,
                                "1990-05-15",
                                "A+",
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                "fijo"
                        )))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.tipoResidencia").value("El tipo de residencia debe ser 'permanente' o 'transitorio'"));
    }

    private record PacienteJson(
            String nombre,
            String apellido,
            Integer dni,
            String fechaNacimiento,
            String tipoSangre,
            String telefono,
            String tipoTelefono,
            String direccion,
            Integer numeroDireccion,
            Integer piso,
            Integer idLocalidad,
            String tipoResidencia
    ) {}
}