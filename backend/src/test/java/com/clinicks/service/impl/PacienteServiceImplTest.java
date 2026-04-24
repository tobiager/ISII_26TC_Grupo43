package com.clinicks.service.impl;

import com.clinicks.dto.ContactoEmergenciaDTO;
import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.exception.AfiliadoDuplicadoException;
import com.clinicks.exception.DniDuplicadoException;
import com.clinicks.exception.TelefonoDuplicadoException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PacienteServiceImplTest {

    @Mock private PacienteRepository             pacienteRepository;
    @Mock private ObraSocialRepository           obraSocialRepository;
    @Mock private AfiliacionObraSocialRepository afiliacionRepository;
    @Mock private TelefonoRepository             telefonoRepository;
    @Mock private AlergiaRepository              alergiaRepository;
    @Mock private EnfermedadCronicaRepository    enfermedadCronicaRepository;
    @Mock private AntecedenteFamiliarRepository  antecedenteFamiliarRepository;
    @Mock private ContactoEmergenciaRepository   contactoEmergenciaRepository;
    @Mock private LocalidadRepository            localidadRepository;
    @Mock private HistorialMedicoRepository      historialMedicoRepository;

    @InjectMocks
    private PacienteServiceImpl service;

    private PacienteRequestDTO dtoValido;
    private Paciente pacienteGuardado;

    @BeforeEach
    void setUp() {
        dtoValido = new PacienteRequestDTO();
        dtoValido.setNombre("juan carlos");
        dtoValido.setApellido("del valle");
        dtoValido.setDni(12345678);
        dtoValido.setFechaNacimiento(LocalDate.of(1990, 5, 15));
        dtoValido.setTipoSangre("A+");
        dtoValido.setTelefono("1123456789");
        dtoValido.setTipoTelefono("personal");
        dtoValido.setDireccion("Corrientes");
        dtoValido.setNumeroDireccion(1234);
        dtoValido.setTipoResidencia("permanente");
        dtoValido.setAlergias(new ArrayList<>());
        dtoValido.setEnfermedadesCronicas(new ArrayList<>());
        dtoValido.setAntecedentesFamiliares(new ArrayList<>());
        dtoValido.setContactosEmergencia(new ArrayList<>());

        FichaMedica ficha = FichaMedica.builder()
                .tipoSangre("A+")
                .alergias(new HashSet<>())
                .enfermedadesCronicas(new HashSet<>())
                .antecedentesFamiliares(new HashSet<>())
                .build();

        Persona persona = Persona.builder()
                .nombrePersona("Juan Carlos")
                .apellidoPersona("Del Valle")
                .fechaNacimiento(LocalDate.of(1990, 5, 15).atStartOfDay())
                .build();

        Domicilio domicilio = Domicilio.builder()
                .calle("Corrientes")
                .numero(1234)
                .build();

        Residencia residencia = Residencia.builder()
                .tipoResidencia("permanente")
                .domicilio(domicilio)
                .build();

        pacienteGuardado = Paciente.builder()
                .idPaciente(1)
                .dni(12345678)
                .persona(persona)
                .fichaMedica(ficha)
                .residencia(residencia)
                .build();
    }

    // ─── Registro exitoso ──────────────────────────────────────────────────────

    @Test
    void crearPaciente_exitoso_devuelveDTO() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(false);
        when(localidadRepository.findAll()).thenReturn(new ArrayList<>());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);
        when(historialMedicoRepository.existePorPaciente(pacienteGuardado)).thenReturn(false);
        when(telefonoRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());

        PacienteResponseDTO resultado = service.crearPaciente(dtoValido);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getDni()).isEqualTo(12345678);
        verify(pacienteRepository, atLeast(1)).save(any(Paciente.class));
    }

    // ─── Normalización de nombre y apellido ────────────────────────────────────

    @Test
    void crearPaciente_normalizaNombreYApellido_primeraLetraMayuscula() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(false);
        when(localidadRepository.findAll()).thenReturn(new ArrayList<>());
        when(pacienteRepository.save(any(Paciente.class))).thenAnswer(inv -> {
            Paciente p = inv.getArgument(0);
            p.setIdPaciente(1);
            return p;
        });
        when(historialMedicoRepository.existePorPaciente(any())).thenReturn(false);
        when(telefonoRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());

        dtoValido.setNombre("JUAN carlos");
        dtoValido.setApellido("del VALLE");

        PacienteResponseDTO resultado = service.crearPaciente(dtoValido);

        assertThat(resultado.getNombre()).isEqualTo("Juan Carlos");
        assertThat(resultado.getApellido()).isEqualTo("Del Valle");
    }

    // ─── DNI duplicado ────────────────────────────────────────────────────────

    @Test
    void crearPaciente_lanzaDniDuplicadoException_siDniYaExiste() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido))
                .isInstanceOf(DniDuplicadoException.class)
                .hasMessageContaining("12345678");
    }

    @Test
    void actualizarPaciente_lanzaDniDuplicadoException_siDniExisteEnOtroPaciente() {
        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(java.util.Optional.of(pacienteGuardado));
        when(pacienteRepository.existePorDniYNoIdPaciente(12345678, 1)).thenReturn(true);

        assertThatThrownBy(() -> service.actualizarPaciente(1, dtoValido))
                .isInstanceOf(DniDuplicadoException.class)
                .hasMessageContaining("12345678");
    }

    // ─── Teléfono duplicado ───────────────────────────────────────────────────

    @Test
    void crearPaciente_lanzaTelefonoDuplicadoException_siTelefonoYaExisteEnTablaTelefono() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido))
                .isInstanceOf(TelefonoDuplicadoException.class)
                .hasMessageContaining("1123456789");
    }

    @Test
    void crearPaciente_lanzaTelefonoDuplicadoException_siTelefonoYaExisteComoContactoEmergencia() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido))
                .isInstanceOf(TelefonoDuplicadoException.class);
    }

    @Test
    void crearPaciente_lanzaTelefonoDuplicadoException_siContactoEmergenciaTieneTelefonoRepetido() {
        ContactoEmergenciaDTO c1 = ContactoEmergenciaDTO.builder()
                .nombre("Ana García").telefono("1187654321").parentesco("Madre").build();
        ContactoEmergenciaDTO c2 = ContactoEmergenciaDTO.builder()
                .nombre("Luis García").telefono("1187654321").parentesco("Padre").build();
        dtoValido.setContactosEmergencia(List.of(c1, c2));

        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(false);
        when(telefonoRepository.existePorNumero("1187654321")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1187654321")).thenReturn(false);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido))
                .isInstanceOf(TelefonoDuplicadoException.class)
                .hasMessageContaining("1187654321");
    }

    // ─── Afiliado duplicado ───────────────────────────────────────────────────

    @Test
    void crearPaciente_lanzaAfiliadoDuplicadoException_siNroAfiliadoYaExiste() {
        dtoValido.setIdObraSocial(1);
        dtoValido.setNroAfiliado("ABC123");

        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(pacienteRepository.existePorAfiliacionYObraSocialId("ABC123", 1, null)).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido))
                .isInstanceOf(AfiliadoDuplicadoException.class)
                .hasMessageContaining("ABC123");
    }

    // ─── Validaciones del DTO (Bean Validation) ───────────────────────────────

    @Nested
    class ValidacionesDTO {

        private Validator validator;

        @BeforeEach
        void setUpValidator() {
            ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
            validator = factory.getValidator();
        }

        private boolean tieneViolacionEnCampo(Set<ConstraintViolation<PacienteRequestDTO>> v, String campo) {
            return v.stream().anyMatch(cv -> cv.getPropertyPath().toString().equals(campo));
        }

        @Test
        void nombre_obligatorio() {
            dtoValido.setNombre(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "nombre")).isTrue();
        }

        @Test
        void apellido_obligatorio() {
            dtoValido.setApellido(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "apellido")).isTrue();
        }

        @Test
        void dni_obligatorio() {
            dtoValido.setDni(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "dni")).isTrue();
        }

        @Test
        void dni_debeSerPositivo() {
            dtoValido.setDni(-1);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "dni")).isTrue();
        }

        @Test
        void fechaNacimiento_obligatoria() {
            dtoValido.setFechaNacimiento(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaNacimiento")).isTrue();
        }

        @Test
        void fechaNacimiento_noPuedeSerFutura() {
            dtoValido.setFechaNacimiento(LocalDate.now().plusDays(1));
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaNacimiento")).isTrue();
        }

        @Test
        void numeroDireccion_debeSerPositivo() {
            dtoValido.setNumeroDireccion(-5);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "numeroDireccion")).isTrue();
        }

        @Test
        void numeroDireccion_noPuedeSerCero() {
            dtoValido.setNumeroDireccion(0);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "numeroDireccion")).isTrue();
        }

        @Test
        void piso_siSeProvee_noDebeSerNegativo() {
            dtoValido.setPiso(-1);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "piso")).isTrue();
        }

        @Test
        void piso_siSeProvee_noPuedeSerCero() {
            dtoValido.setPiso(0);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "piso")).isTrue();
        }

        @Test
        void piso_siEsNulo_esValido() {
            dtoValido.setPiso(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "piso")).isFalse();
        }

        @Test
        void fechaVencimientoAfiliacion_noPuedeSerPasada() {
            dtoValido.setFechaVencimientoAfiliacion(LocalDate.now().minusDays(1));
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaVencimientoAfiliacion")).isTrue();
        }

        @Test
        void fechaVencimientoAfiliacion_noPuedeSserHoy() {
            dtoValido.setFechaVencimientoAfiliacion(LocalDate.now());
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaVencimientoAfiliacion")).isTrue();
        }

        @Test
        void fechaVencimientoAfiliacion_siEsFutura_esValida() {
            dtoValido.setFechaVencimientoAfiliacion(LocalDate.now().plusDays(30));
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaVencimientoAfiliacion")).isFalse();
        }

        @Test
        void fechaVencimientoAfiliacion_siEsNula_esValida() {
            dtoValido.setFechaVencimientoAfiliacion(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "fechaVencimientoAfiliacion")).isFalse();
        }
    }
}
