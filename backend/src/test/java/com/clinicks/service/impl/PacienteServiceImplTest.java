package com.clinicks.service.impl;

import com.clinicks.dto.ContactoEmergenciaDTO;
import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.exception.AfiliadoDuplicadoException;
import com.clinicks.exception.DniDuplicadoException;
import com.clinicks.exception.OperacionNoPermitidaException;
import com.clinicks.exception.PacienteNoEncontradoException;
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
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
    @Mock private RegistroClinicoRepository      registroClinicoRepository;
    @Mock private TipoProcedimientoRepository    tipoProcedimientoRepository;
    @Mock private UsuarioRepository              usuarioRepository;
    @Mock private InternacionRepository          internacionRepository;

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

    // ─── crearPaciente: Registro exitoso ────────────────────────────────────────

    @Test
    void crearPaciente_exitoso_devuelveDTO() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(false);
        when(localidadRepository.findAll()).thenReturn(new ArrayList<>());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);
        when(historialMedicoRepository.encontrarPorIdPaciente(anyInt())).thenReturn(Optional.empty());
        when(historialMedicoRepository.save(any())).thenReturn(HistorialMedico.builder()
                .estadoHistorial("activo").build());
        when(tipoProcedimientoRepository.findByNombreTipoProcedimiento(anyString())).thenReturn(Optional.empty());
        when(telefonoRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());

        PacienteResponseDTO resultado = service.crearPaciente(dtoValido, 1);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getDni()).isEqualTo(12345678);
        verify(pacienteRepository, atLeast(1)).save(any(Paciente.class));
    }

    // ─── crearPaciente: Normalización de nombre y apellido ──────────────────────

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
        when(historialMedicoRepository.encontrarPorIdPaciente(anyInt())).thenReturn(Optional.empty());
        when(historialMedicoRepository.save(any())).thenReturn(HistorialMedico.builder()
                .estadoHistorial("activo").build());
        when(tipoProcedimientoRepository.findByNombreTipoProcedimiento(anyString())).thenReturn(Optional.empty());
        when(telefonoRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());

        dtoValido.setNombre("JUAN carlos");
        dtoValido.setApellido("del VALLE");

        PacienteResponseDTO resultado = service.crearPaciente(dtoValido, 1);

        assertThat(resultado.getNombre()).isEqualTo("Juan Carlos");
        assertThat(resultado.getApellido()).isEqualTo("Del Valle");
    }

    // ─── crearPaciente: DNI duplicado ───────────────────────────────────────────

    @Test
    void crearPaciente_lanzaDniDuplicadoException_siDniYaExiste() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido, 1))
                .isInstanceOf(DniDuplicadoException.class)
                .hasMessageContaining("12345678");
    }

    // ─── crearPaciente: Teléfono duplicado ──────────────────────────────────────

    @Test
    void crearPaciente_lanzaTelefonoDuplicadoException_siTelefonoYaExisteEnTablaTelefono() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido, 1))
                .isInstanceOf(TelefonoDuplicadoException.class)
                .hasMessageContaining("1123456789");
    }

    @Test
    void crearPaciente_lanzaTelefonoDuplicadoException_siTelefonoYaExisteComoContactoEmergencia() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido, 1))
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

        assertThatThrownBy(() -> service.crearPaciente(dtoValido, 1))
                .isInstanceOf(TelefonoDuplicadoException.class)
                .hasMessageContaining("1187654321");
    }

    // ─── crearPaciente: Afiliado duplicado ──────────────────────────────────────

    @Test
    void crearPaciente_lanzaAfiliadoDuplicadoException_siNroAfiliadoYaExiste() {
        dtoValido.setIdObraSocial(1);
        dtoValido.setNroAfiliado("ABC123");

        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(pacienteRepository.existePorAfiliacionYObraSocialId("ABC123", 1, null)).thenReturn(true);

        assertThatThrownBy(() -> service.crearPaciente(dtoValido, 1))
                .isInstanceOf(AfiliadoDuplicadoException.class)
                .hasMessageContaining("ABC123");
    }

    // ─── crearPaciente: Sin dirección usa valor por defecto ─────────────────────

    @Test
    void crearPaciente_sinDireccion_usaValorPorDefecto() {
        dtoValido.setDireccion(null);
        dtoValido.setNumeroDireccion(null);

        when(pacienteRepository.existePorDni(12345678)).thenReturn(false);
        when(telefonoRepository.existePorNumero("1123456789")).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefono("1123456789")).thenReturn(false);
        when(localidadRepository.findAll()).thenReturn(new ArrayList<>());
        when(pacienteRepository.save(any(Paciente.class))).thenAnswer(inv -> {
            Paciente p = inv.getArgument(0);
            p.setIdPaciente(2);
            p.setFichaMedica(FichaMedica.builder().tipoSangre("A+")
                    .alergias(new HashSet<>()).enfermedadesCronicas(new HashSet<>())
                    .antecedentesFamiliares(new HashSet<>()).build());
            return p;
        });
        when(historialMedicoRepository.encontrarPorIdPaciente(anyInt())).thenReturn(Optional.empty());
        when(historialMedicoRepository.save(any())).thenReturn(HistorialMedico.builder()
                .estadoHistorial("activo").build());
        when(tipoProcedimientoRepository.findByNombreTipoProcedimiento(anyString())).thenReturn(Optional.empty());
        when(telefonoRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(any())).thenReturn(new ArrayList<>());

        PacienteResponseDTO resultado = service.crearPaciente(dtoValido, 1);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getDireccion()).isEqualTo("Sin dirección");
    }

    // ─── actualizarPaciente ─────────────────────────────────────────────────────

    @Test
    void actualizarPaciente_lanzaDniDuplicadoException_siDniExisteEnOtroPaciente() {
        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(Optional.of(pacienteGuardado));
        when(pacienteRepository.existePorDniYNoIdPaciente(12345678, 1)).thenReturn(true);

        assertThatThrownBy(() -> service.actualizarPaciente(1, dtoValido))
                .isInstanceOf(DniDuplicadoException.class)
                .hasMessageContaining("12345678");
    }

    @Test
    void actualizarPaciente_exitoso_devuelveDTOActualizado() {
        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(Optional.of(pacienteGuardado));
        when(pacienteRepository.existePorDniYNoIdPaciente(12345678, 1)).thenReturn(false);
        when(telefonoRepository.existePorNumeroEnOtroPaciente("1123456789", 1)).thenReturn(false);
        when(contactoEmergenciaRepository.existePorTelefonoEnOtroPaciente("1123456789", 1)).thenReturn(false);
        when(localidadRepository.findAll()).thenReturn(new ArrayList<>());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);
        when(telefonoRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());

        PacienteResponseDTO resultado = service.actualizarPaciente(1, dtoValido);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getDni()).isEqualTo(12345678);
        verify(pacienteRepository).save(any(Paciente.class));
    }

    @Test
    void actualizarPaciente_pacienteNoExiste_lanzaPacienteNoEncontradoException() {
        when(pacienteRepository.encontrarPacienteActivoPorId(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.actualizarPaciente(999, dtoValido))
                .isInstanceOf(PacienteNoEncontradoException.class)
                .hasMessageContaining("999");
    }

    // ─── obtenerPacientePorId ───────────────────────────────────────────────────

    @Test
    void obtenerPacientePorId_existente_devuelveDTO() {
        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(Optional.of(pacienteGuardado));
        when(telefonoRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());
        when(contactoEmergenciaRepository.encontrarPorPaciente(pacienteGuardado)).thenReturn(new ArrayList<>());

        PacienteResponseDTO resultado = service.obtenerPacientePorId(1);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getDni()).isEqualTo(12345678);
        assertThat(resultado.getNombre()).isEqualTo("Juan Carlos");
    }

    @Test
    void obtenerPacientePorId_inexistente_lanzaPacienteNoEncontradoException() {
        when(pacienteRepository.encontrarPacienteActivoPorId(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerPacientePorId(999))
                .isInstanceOf(PacienteNoEncontradoException.class)
                .hasMessageContaining("999");
    }

    // ─── eliminarPaciente (soft delete) ─────────────────────────────────────────

    @Test
    void eliminarPaciente_exitoso_seteaDeletedAt() {
        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(Optional.of(pacienteGuardado));
        when(internacionRepository.encontrarActivaPorPaciente(1)).thenReturn(Optional.empty());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);

        service.eliminarPaciente(1);

        assertThat(pacienteGuardado.getDeletedAt()).isNotNull();
        verify(pacienteRepository).save(pacienteGuardado);
    }

    @Test
    void eliminarPaciente_pacienteInexistente_lanzaPacienteNoEncontradoException() {
        when(pacienteRepository.encontrarPacienteActivoPorId(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.eliminarPaciente(999))
                .isInstanceOf(PacienteNoEncontradoException.class)
                .hasMessageContaining("999");
    }

    @Test
    void eliminarPaciente_pacienteInternado_lanzaOperacionNoPermitidaException() {
        Internacion internacionActiva = Internacion.builder()
                .id(1).fechaInicio(LocalDateTime.now()).cantidadTraslados(0).build();

        when(pacienteRepository.encontrarPacienteActivoPorId(1)).thenReturn(Optional.of(pacienteGuardado));
        when(internacionRepository.encontrarActivaPorPaciente(1)).thenReturn(Optional.of(internacionActiva));

        assertThatThrownBy(() -> service.eliminarPaciente(1))
                .isInstanceOf(OperacionNoPermitidaException.class)
                .hasMessageContaining("internado");
    }

    // ─── restaurarPaciente ──────────────────────────────────────────────────────

    @Test
    void restaurarPaciente_exitoso_seteaDeletedAtNull() {
        pacienteGuardado.setDeletedAt(OffsetDateTime.now());
        when(pacienteRepository.findById(1)).thenReturn(Optional.of(pacienteGuardado));
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);

        service.restaurarPaciente(1);

        assertThat(pacienteGuardado.getDeletedAt()).isNull();
        verify(pacienteRepository).save(pacienteGuardado);
    }

    @Test
    void restaurarPaciente_pacienteInexistente_lanzaPacienteNoEncontradoException() {
        when(pacienteRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.restaurarPaciente(999))
                .isInstanceOf(PacienteNoEncontradoException.class)
                .hasMessageContaining("999");
    }

    // ─── existeDni ──────────────────────────────────────────────────────────────

    @Test
    void existeDni_sinExcluirId_devuelveTrue_siDniExiste() {
        when(pacienteRepository.existePorDni(12345678)).thenReturn(true);

        boolean resultado = service.existeDni(12345678, null);

        assertThat(resultado).isTrue();
    }

    @Test
    void existeDni_sinExcluirId_devuelveFalse_siDniNoExiste() {
        when(pacienteRepository.existePorDni(99999999)).thenReturn(false);

        boolean resultado = service.existeDni(99999999, null);

        assertThat(resultado).isFalse();
    }

    @Test
    void existeDni_conExcluirId_delegaAMetodoCorrectoDelRepositorio() {
        when(pacienteRepository.existePorDniYNoIdPaciente(12345678, 1)).thenReturn(true);

        boolean resultado = service.existeDni(12345678, 1);

        assertThat(resultado).isTrue();
        verify(pacienteRepository).existePorDniYNoIdPaciente(12345678, 1);
    }

    // ─── existeAfiliado ─────────────────────────────────────────────────────────

    @Test
    void existeAfiliado_sinNroAfiliado_devuelveFalse() {
        boolean resultado = service.existeAfiliado(null, 1, "OSDE", null);

        assertThat(resultado).isFalse();
    }

    @Test
    void existeAfiliado_conNroAfiliadoVacio_devuelveFalse() {
        boolean resultado = service.existeAfiliado("", 1, "OSDE", null);

        assertThat(resultado).isFalse();
    }

    @Test
    void existeAfiliado_conIdObraSocial_buscaPorId() {
        when(pacienteRepository.existePorAfiliacionYObraSocialId("ABC123", 1, null)).thenReturn(true);

        boolean resultado = service.existeAfiliado("ABC123", 1, null, null);

        assertThat(resultado).isTrue();
        verify(pacienteRepository).existePorAfiliacionYObraSocialId("ABC123", 1, null);
    }

    @Test
    void existeAfiliado_conNombreObraSocial_buscaPorNombre() {
        when(pacienteRepository.existePorAfiliacionYObraSocialNombre("ABC123", "OSDE", null)).thenReturn(true);

        boolean resultado = service.existeAfiliado("ABC123", null, "OSDE", null);

        assertThat(resultado).isTrue();
        verify(pacienteRepository).existePorAfiliacionYObraSocialNombre("ABC123", "OSDE", null);
    }

    @Test
    void existeAfiliado_sinIdNiNombreObraSocial_devuelveFalse() {
        boolean resultado = service.existeAfiliado("ABC123", null, null, null);

        assertThat(resultado).isFalse();
    }

    // ─── obtenerTodosLosPacientes ───────────────────────────────────────────────

    @Test
    void obtenerTodosLosPacientes_sinPacientes_devuelveListaVacia() {
        when(pacienteRepository.encontrarTodosLosPacientesActivosConDetalles()).thenReturn(new ArrayList<>());

        List<PacienteResponseDTO> resultado = service.obtenerTodosLosPacientes();

        assertThat(resultado).isEmpty();
    }

    // ─── obtenerPacientesEliminados ─────────────────────────────────────────────

    @Test
    void obtenerPacientesEliminados_sinPacientes_devuelveListaVacia() {
        when(pacienteRepository.encontrarTodosLosPacientesEliminadosConDetalles()).thenReturn(new ArrayList<>());

        List<PacienteResponseDTO> resultado = service.obtenerPacientesEliminados();

        assertThat(resultado).isEmpty();
    }

    // ─── Validaciones del DTO (Bean Validation) ─────────────────────────────────

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
        void dtoValido_noTieneViolaciones() {
            var v = validator.validate(dtoValido);
            assertThat(v).isEmpty();
        }

        @Test
        void nombre_obligatorio() {
            dtoValido.setNombre(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "nombre")).isTrue();
        }

        @Test
        void nombre_vacio_invalido() {
            dtoValido.setNombre("");
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
        void apellido_vacio_invalido() {
            dtoValido.setApellido("");
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
        void dni_cero_invalido() {
            dtoValido.setDni(0);
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
        void tipoSangre_obligatorio() {
            dtoValido.setTipoSangre(null);
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoSangre")).isTrue();
        }

        @Test
        void tipoSangre_invalido_lanzaViolacion() {
            dtoValido.setTipoSangre("XY");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoSangre")).isTrue();
        }

        @Test
        void tipoSangre_valido_sinViolaciones() {
            dtoValido.setTipoSangre("O-");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoSangre")).isFalse();
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
        void tipoTelefono_invalido_lanzaViolacion() {
            dtoValido.setTipoTelefono("laboral");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoTelefono")).isTrue();
        }

        @Test
        void tipoTelefono_personal_esValido() {
            dtoValido.setTipoTelefono("personal");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoTelefono")).isFalse();
        }

        @Test
        void tipoTelefono_emergencia_esValido() {
            dtoValido.setTipoTelefono("emergencia");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoTelefono")).isFalse();
        }

        @Test
        void tipoResidencia_invalido_lanzaViolacion() {
            dtoValido.setTipoResidencia("temporal");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoResidencia")).isTrue();
        }

        @Test
        void tipoResidencia_permanente_esValido() {
            dtoValido.setTipoResidencia("permanente");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoResidencia")).isFalse();
        }

        @Test
        void tipoResidencia_transitorio_esValido() {
            dtoValido.setTipoResidencia("transitorio");
            var v = validator.validate(dtoValido);
            assertThat(tieneViolacionEnCampo(v, "tipoResidencia")).isFalse();
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
