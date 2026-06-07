package com.clinicks.service.impl;

import com.clinicks.dto.habitacion.EgresoRequestDTO;
import com.clinicks.dto.habitacion.InternacionRequestDTO;
import com.clinicks.dto.habitacion.TrasladoRequestDTO;
import com.clinicks.dto.habitacion.HabitacionResponseDTO;
import com.clinicks.exception.HabitacionNoDisponibleException;
import com.clinicks.exception.InternacionNoEncontradaException;
import com.clinicks.exception.OperacionNoPermitidaException;
import com.clinicks.exception.PacienteNoEncontradoException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HabitacionServiceImplTest {

    @Mock private HabitacionInternacionRepository habitacionRepository;
    @Mock private InternacionRepository internacionRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private HistorialMedicoRepository historialRepository;
    @Mock private RegistroClinicoRepository registroRepository;
    @Mock private TipoProcedimientoRepository tipoRepository;
    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks
    private HabitacionServiceImpl service;

    private HabitacionInternacion habitacionDisponible;
    private HabitacionInternacion habitacionOcupada;
    private HabitacionInternacion habitacionMantenimiento;
    private HabitacionInternacion habitacionDestino;
    private Paciente paciente;
    private HistorialMedico historial;
    private Usuario usuario;
    private TipoProcedimiento tipoProcedimiento;
    private InternacionRequestDTO request;
    private Internacion internacionActiva;

    @BeforeEach
    void setUp() {
        habitacionDisponible = HabitacionInternacion.builder()
                .id(1)
                .numeroHabitacion("101")
                .pisoHabitacion(1)
                .estadoHabitacion("disponible")
                .build();

        habitacionOcupada = HabitacionInternacion.builder()
                .id(2)
                .numeroHabitacion("102")
                .pisoHabitacion(1)
                .estadoHabitacion("ocupada")
                .build();

        habitacionMantenimiento = HabitacionInternacion.builder()
                .id(3)
                .numeroHabitacion("103")
                .pisoHabitacion(1)
                .estadoHabitacion("mantenimiento")
                .build();

        habitacionDestino = HabitacionInternacion.builder()
                .id(4)
                .numeroHabitacion("201")
                .pisoHabitacion(2)
                .estadoHabitacion("disponible")
                .build();

        Persona persona = Persona.builder()
                .idPersona(10)
                .nombrePersona("Juan")
                .apellidoPersona("Perez")
                .fechaNacimiento(LocalDateTime.of(1990, 5, 15, 0, 0))
                .build();

        Rol rol = Rol.builder()
                .idRol(2)
                .nombreRol("ENFERMERO")
                .build();

        paciente = Paciente.builder()
                .idPaciente(10)
                .dni(12345678)
                .persona(persona)
                .build();

        historial = HistorialMedico.builder()
                .idHistorial(20)
                .paciente(paciente)
                .estadoHistorial("activo")
                .fechaCreacion(LocalDateTime.of(2026, 5, 18, 10, 0))
                .fechaActualizacion(LocalDateTime.of(2026, 5, 18, 10, 0))
                .build();

        usuario = Usuario.builder()
                .idUsuario(5)
                .email("enfermero@clinicks.com")
                .pass("hash")
                .autorizacion("ACTIVO")
                .rol(rol)
                .persona(persona)
                .build();

        tipoProcedimiento = TipoProcedimiento.builder()
                .id(1)
                .nombreTipoProcedimiento("Internación")
                .build();

        request = new InternacionRequestDTO();
        request.setIdPaciente(10);
        request.setMotivo("Dolor abdominal");
        request.setObservaciones("Se asigna habitación por observación");

        internacionActiva = Internacion.builder()
                .id(99)
                .fechaInicio(LocalDateTime.of(2026, 5, 18, 9, 0))
                .cantidadTraslados(0)
                .historial(historial)
                .habitacion(habitacionOcupada)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // listarHabitaciones
    // ═══════════════════════════════════════════════════════════════════════════

    @Nested
    class ValidacionesListarHabitaciones
    {
        @Test
        void listarHabitaciones_devuelveListaDeHabitaciones() {
                when(habitacionRepository.findAllByOrderByPisoHabitacionAscNumeroHabitacionAsc())
                        .thenReturn(List.of(habitacionDisponible, habitacionMantenimiento));

                List<HabitacionResponseDTO> resultado = service.listarHabitaciones();

                assertThat(resultado).hasSize(2);
                assertThat(resultado.get(0).getNumeroHabitacion()).isEqualTo("101");
                assertThat(resultado.get(0).getEstadoHabitacion()).isEqualTo("disponible");
                assertThat(resultado.get(1).getNumeroHabitacion()).isEqualTo("103");
        }

        @Test
        void listarHabitaciones_sinHabitaciones_devuelveListaVacia() {
                when(habitacionRepository.findAllByOrderByPisoHabitacionAscNumeroHabitacionAsc())
                        .thenReturn(List.of());

                List<HabitacionResponseDTO> resultado = service.listarHabitaciones();

                assertThat(resultado).isEmpty();
        }

        @Test
        void listarHabitaciones_conHabitacionOcupada_incluyeDatosPaciente() {
                when(habitacionRepository.findAllByOrderByPisoHabitacionAscNumeroHabitacionAsc())
                        .thenReturn(List.of(habitacionOcupada));
                when(internacionRepository.encontrarActivaPorHabitacion(habitacionOcupada))
                        .thenReturn(Optional.of(internacionActiva));

                List<HabitacionResponseDTO> resultado = service.listarHabitaciones();

                assertThat(resultado).hasSize(1);
                assertThat(resultado.get(0).getEstadoHabitacion()).isEqualTo("ocupada");
                assertThat(resultado.get(0).getPacienteActual()).isNotNull();
                assertThat(resultado.get(0).getPacienteActual().getDni()).isEqualTo(12345678);
                assertThat(resultado.get(0).getInternacionActual()).isNotNull();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // internarPaciente
    // ═══════════════════════════════════════════════════════════════════════════

    @Nested
    class ValidacionesInternarPaciente
    {

        @Test
        void internarPaciente_exitoso_asignaHabitacionYRegistraEvento() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(pacienteRepository.encontrarPacienteActivoPorId(10)).thenReturn(Optional.of(paciente));
                when(internacionRepository.encontrarActivaPorPaciente(10)).thenReturn(Optional.empty());
                when(historialRepository.encontrarPorIdPaciente(10)).thenReturn(Optional.of(historial));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Internación")).thenReturn(Optional.of(tipoProcedimiento));
                when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
                when(registroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.internarPaciente(1, request, 5);

                assertThat(habitacionDisponible.getEstadoHabitacion()).isEqualTo("ocupada");
                verify(internacionRepository).save(any(Internacion.class));
                verify(registroRepository).save(any(RegistroClinico.class));
                verify(historialRepository).save(any(HistorialMedico.class));
        }

        @Test
        void internarPaciente_conHabitacionOcupada_lanzaHabitacionNoDisponibleException() {
                when(habitacionRepository.findById(2)).thenReturn(Optional.of(habitacionOcupada));

                assertThatThrownBy(() -> service.internarPaciente(2, request, 5))
                        .isInstanceOf(HabitacionNoDisponibleException.class)
                        .hasMessage("La habitación 102 no está disponible.");
        }

        @Test
        void internarPaciente_conHabitacionEnMantenimiento_lanzaHabitacionNoDisponibleException() {
                when(habitacionRepository.findById(3)).thenReturn(Optional.of(habitacionMantenimiento));

                assertThatThrownBy(() -> service.internarPaciente(3, request, 5))
                        .isInstanceOf(HabitacionNoDisponibleException.class)
                        .hasMessage("La habitación 103 no está disponible.");
        }

        @Test
        void internarPaciente_sinObservaciones_igualmenteAsignaHabitacion() {
                request.setMotivo("Dolor abdominal");
                request.setObservaciones(null);

                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(pacienteRepository.encontrarPacienteActivoPorId(10)).thenReturn(Optional.of(paciente));
                when(internacionRepository.encontrarActivaPorPaciente(10)).thenReturn(Optional.empty());
                when(historialRepository.encontrarPorIdPaciente(10)).thenReturn(Optional.of(historial));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Internación")).thenReturn(Optional.of(tipoProcedimiento));
                when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
                when(registroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.internarPaciente(1, request, 5);

                assertThat(habitacionDisponible.getEstadoHabitacion()).isEqualTo("ocupada");
                verify(registroRepository).save(any(RegistroClinico.class));
        }

        @Test
        void internarPaciente_conPacienteInexistente_lanzaPacienteNoEncontradoException() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(pacienteRepository.encontrarPacienteActivoPorId(10)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.internarPaciente(1, request, 5))
                        .isInstanceOf(PacienteNoEncontradoException.class)
                        .hasMessageContaining("10");
        }

        @Test
        void internarPaciente_conPacienteYaInternado_lanzaOperacionNoPermitidaException() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(pacienteRepository.encontrarPacienteActivoPorId(10)).thenReturn(Optional.of(paciente));
                when(internacionRepository.encontrarActivaPorPaciente(10)).thenReturn(Optional.of(internacionActiva));

                assertThatThrownBy(() -> service.internarPaciente(1, request, 5))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessage("El paciente ya se encuentra internado.");
        }

        @Test
        void internarPaciente_conHabitacionInexistente_lanzaRuntimeException() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.internarPaciente(1, request, 5))
                        .isInstanceOf(RuntimeException.class)
                        .hasMessage("Habitación no encontrada");
        }

        @Test
        void internarPaciente_sinHistorialPrevio_creaHistorialNuevo() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(pacienteRepository.encontrarPacienteActivoPorId(10)).thenReturn(Optional.of(paciente));
                when(internacionRepository.encontrarActivaPorPaciente(10)).thenReturn(Optional.empty());
                when(historialRepository.encontrarPorIdPaciente(10)).thenReturn(Optional.empty());
                when(historialRepository.save(any())).thenReturn(historial);
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Internación")).thenReturn(Optional.of(tipoProcedimiento));
                when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
                when(registroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.internarPaciente(1, request, 5);

                verify(historialRepository, times(2)).save(any(HistorialMedico.class));
                assertThat(habitacionDisponible.getEstadoHabitacion()).isEqualTo("ocupada");
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // trasladarPaciente
    // ═══════════════════════════════════════════════════════════════════════════

    @Nested
    class ValidacionesTrasladarPaciente
    {

        @Test
        void trasladarPaciente_exitoso_cambiaHabitaciones() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(4);
                trasladoDTO.setMotivo("Necesidad de aislamiento");
                trasladoDTO.setObservaciones("Paciente requiere cuarto individual");

                internacionActiva.setHabitacion(habitacionOcupada);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(habitacionRepository.findById(4)).thenReturn(Optional.of(habitacionDestino));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Traslado de habitación")).thenReturn(Optional.of(
                        TipoProcedimiento.builder().id(2).nombreTipoProcedimiento("Traslado de habitación").build()));
                when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
                when(registroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.trasladarPaciente(99, trasladoDTO, 5);

                assertThat(habitacionOcupada.getEstadoHabitacion()).isEqualTo("disponible");
                assertThat(habitacionDestino.getEstadoHabitacion()).isEqualTo("ocupada");
                assertThat(internacionActiva.getHabitacion()).isEqualTo(habitacionDestino);
                assertThat(internacionActiva.getCantidadTraslados()).isEqualTo(1);
        }

        @Test
        void trasladarPaciente_internacionNoExiste_lanzaInternacionNoEncontradaException() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(4);

                when(internacionRepository.findById(999)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.trasladarPaciente(999, trasladoDTO, 5))
                        .isInstanceOf(InternacionNoEncontradaException.class)
                        .hasMessageContaining("999");
        }

        @Test
        void trasladarPaciente_internacionYaCerrada_lanzaOperacionNoPermitidaException() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(4);

                internacionActiva.setFechaFin(LocalDateTime.now());

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));

                assertThatThrownBy(() -> service.trasladarPaciente(99, trasladoDTO, 5))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessage("La internación ya fue cerrada.");
        }

        @Test
        void trasladarPaciente_destinoNoDisponible_lanzaHabitacionNoDisponibleException() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(2);

                // Reset fechaFin to null for active internacion
                internacionActiva.setFechaFin(null);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(habitacionRepository.findById(2)).thenReturn(Optional.of(habitacionOcupada));

                assertThatThrownBy(() -> service.trasladarPaciente(99, trasladoDTO, 5))
                        .isInstanceOf(HabitacionNoDisponibleException.class)
                        .hasMessageContaining("102");
        }

        @Test
        void trasladarPaciente_destinoInexistente_lanzaRuntimeException() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(999);

                internacionActiva.setFechaFin(null);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(habitacionRepository.findById(999)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.trasladarPaciente(99, trasladoDTO, 5))
                        .isInstanceOf(RuntimeException.class)
                        .hasMessage("Habitación destino no encontrada");
        }

        @Test
        void trasladarPaciente_incrementaCantidadTraslados() {
                TrasladoRequestDTO trasladoDTO = new TrasladoRequestDTO();
                trasladoDTO.setIdHabitacionDestino(4);

                internacionActiva.setFechaFin(null);
                internacionActiva.setCantidadTraslados(2);
                internacionActiva.setHabitacion(habitacionOcupada);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(habitacionRepository.findById(4)).thenReturn(Optional.of(habitacionDestino));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Traslado de habitación")).thenReturn(Optional.empty());

                service.trasladarPaciente(99, trasladoDTO, 5);

                assertThat(internacionActiva.getCantidadTraslados()).isEqualTo(3);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // egresarPaciente
    // ═══════════════════════════════════════════════════════════════════════════

    @Nested
    class ValidacionesEgresarPaciente
    {

        @Test
        void egresarPaciente_exitoso_liberaHabitacionYCierraInternacion() {
                EgresoRequestDTO egresoDTO = new EgresoRequestDTO();
                egresoDTO.setObservaciones("Alta médica sin complicaciones");

                internacionActiva.setFechaFin(null);
                internacionActiva.setHabitacion(habitacionOcupada);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(historialRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Alta médica")).thenReturn(Optional.of(
                        TipoProcedimiento.builder().id(3).nombreTipoProcedimiento("Alta médica").build()));
                when(usuarioRepository.findById(5)).thenReturn(Optional.of(usuario));
                when(registroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.egresarPaciente(99, egresoDTO, 5);

                assertThat(internacionActiva.getFechaFin()).isNotNull();
                assertThat(habitacionOcupada.getEstadoHabitacion()).isEqualTo("disponible");
                verify(registroRepository).save(any(RegistroClinico.class));
        }

        @Test
        void egresarPaciente_internacionNoExiste_lanzaInternacionNoEncontradaException() {
                EgresoRequestDTO egresoDTO = new EgresoRequestDTO();

                when(internacionRepository.findById(999)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.egresarPaciente(999, egresoDTO, 5))
                        .isInstanceOf(InternacionNoEncontradaException.class)
                        .hasMessageContaining("999");
        }

        @Test
        void egresarPaciente_internacionYaCerrada_lanzaOperacionNoPermitidaException() {
                EgresoRequestDTO egresoDTO = new EgresoRequestDTO();

                internacionActiva.setFechaFin(LocalDateTime.now());

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));

                assertThatThrownBy(() -> service.egresarPaciente(99, egresoDTO, 5))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessage("La internación ya fue cerrada.");
        }

        @Test
        void egresarPaciente_sinObservaciones_igualmenteFunciona() {
                EgresoRequestDTO egresoDTO = new EgresoRequestDTO();
                egresoDTO.setObservaciones(null);

                internacionActiva.setFechaFin(null);
                internacionActiva.setHabitacion(habitacionOcupada);

                when(internacionRepository.findById(99)).thenReturn(Optional.of(internacionActiva));
                when(internacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(historialRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
                when(tipoRepository.findByNombreTipoProcedimiento("Alta médica")).thenReturn(Optional.empty());

                service.egresarPaciente(99, egresoDTO, 5);

                assertThat(internacionActiva.getFechaFin()).isNotNull();
                assertThat(habitacionOcupada.getEstadoHabitacion()).isEqualTo("disponible");
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // cambiarEstadoHabitacion
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    class ValidacionesCambiarEstadoHabitacion
    {

        @Test
        void cambiarEstadoHabitacion_deDisponibleAMantenimiento_exitoso() {
                when(habitacionRepository.findById(1)).thenReturn(Optional.of(habitacionDisponible));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.cambiarEstadoHabitacion(1, "mantenimiento");

                assertThat(habitacionDisponible.getEstadoHabitacion()).isEqualTo("mantenimiento");
                verify(habitacionRepository).save(habitacionDisponible);
        }

        @Test
        void cambiarEstadoHabitacion_deMantenimientoADisponible_exitoso() {
                when(habitacionRepository.findById(3)).thenReturn(Optional.of(habitacionMantenimiento));
                when(habitacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

                service.cambiarEstadoHabitacion(3, "disponible");

                assertThat(habitacionMantenimiento.getEstadoHabitacion()).isEqualTo("disponible");
                verify(habitacionRepository).save(habitacionMantenimiento);
        }

        @Test
        void cambiarEstadoHabitacion_estadoInvalido_lanzaOperacionNoPermitidaException() {
                assertThatThrownBy(() -> service.cambiarEstadoHabitacion(1, "cerrada"))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessageContaining("Estado no permitido")
                        .hasMessageContaining("cerrada");
        }

        @Test
        void cambiarEstadoHabitacion_habitacionOcupada_lanzaOperacionNoPermitidaException() {
                when(habitacionRepository.findById(2)).thenReturn(Optional.of(habitacionOcupada));

                assertThatThrownBy(() -> service.cambiarEstadoHabitacion(2, "disponible"))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessageContaining("ocupada");
        }

        @Test
        void cambiarEstadoHabitacion_habitacionInexistente_lanzaRuntimeException() {
                when(habitacionRepository.findById(999)).thenReturn(Optional.empty());

                assertThatThrownBy(() -> service.cambiarEstadoHabitacion(999, "disponible"))
                        .isInstanceOf(RuntimeException.class)
                        .hasMessage("Habitación no encontrada");
        }

        @Test
        void cambiarEstadoHabitacion_estadoOcupado_lanzaOperacionNoPermitidaException() {
                assertThatThrownBy(() -> service.cambiarEstadoHabitacion(1, "ocupada"))
                        .isInstanceOf(OperacionNoPermitidaException.class)
                        .hasMessageContaining("Estado no permitido");
        }
    }
 }