package com.clinicks.service.impl;

import com.clinicks.dto.habitacion.InternacionRequestDTO;
import com.clinicks.exception.HabitacionNoDisponibleException;
import com.clinicks.exception.OperacionNoPermitidaException;
import com.clinicks.exception.PacienteNoEncontradoException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
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
    private Paciente paciente;
    private HistorialMedico historial;
    private Usuario usuario;
    private TipoProcedimiento tipoProcedimiento;
    private InternacionRequestDTO request;

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
    }

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
        void internarPaciente_conMotivoYObservacionesVacios_igualmenteAsignaHabitacion() {
                request.setMotivo("   ");
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
        Internacion internacionActiva = Internacion.builder()
                .id(99)
                .fechaInicio(LocalDateTime.of(2026, 5, 18, 9, 0))
                .cantidadTraslados(0)
                .historial(historial)
                .habitacion(habitacionDisponible)
                .build();

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
}