package com.clinicks.service.impl;

import com.clinicks.dto.habitacion.*;
import com.clinicks.exception.*;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import com.clinicks.service.HabitacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitacionServiceImpl implements HabitacionService {

    private final HabitacionInternacionRepository habitacionRepository;
    private final InternacionRepository           internacionRepository;
    private final PacienteRepository              pacienteRepository;
    private final HistorialMedicoRepository       historialRepository;
    private final RegistroClinicoRepository       registroRepository;
    private final TipoProcedimientoRepository     tipoRepository;
    private final UsuarioRepository               usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionResponseDTO> listarHabitaciones() {
        return habitacionRepository.findAllByOrderByPisoHabitacionAscNumeroHabitacionAsc()
                .stream()
                .map(this::mapear)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void internarPaciente(Integer idHabitacion, InternacionRequestDTO dto, Integer idUsuario) {
        HabitacionInternacion habitacion = habitacionRepository.findById(idHabitacion)
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));

        if (!"disponible".equals(habitacion.getEstadoHabitacion())) {
            throw new HabitacionNoDisponibleException(habitacion.getNumeroHabitacion());
        }

        Paciente paciente = pacienteRepository.encontrarPacienteActivoPorId(dto.getIdPaciente())
                .orElseThrow(() -> new PacienteNoEncontradoException(dto.getIdPaciente()));

        internacionRepository.encontrarActivaPorPaciente(paciente.getIdPaciente()).ifPresent(i -> {
            throw new OperacionNoPermitidaException("El paciente ya se encuentra internado.");
        });

        HistorialMedico historial = historialRepository.encontrarPorIdPaciente(paciente.getIdPaciente())
                .orElseGet(() -> historialRepository.save(HistorialMedico.builder()
                        .paciente(paciente)
                        .estadoHistorial("activo")
                        .fechaCreacion(LocalDateTime.now())
                        .fechaActualizacion(LocalDateTime.now())
                        .build()));

        Internacion internacion = Internacion.builder()
                .fechaInicio(LocalDateTime.now())
                .cantidadTraslados(0)
                .historial(historial)
                .habitacion(habitacion)
                .build();
        internacionRepository.save(internacion);

        habitacion.setEstadoHabitacion("ocupada");
        habitacionRepository.save(habitacion);

        registrarEventoAuto("Internación", buildDescInternar(habitacion, dto), historial, idUsuario);
    }

    @Override
    @Transactional
    public void trasladarPaciente(Integer idInternacion, TrasladoRequestDTO dto, Integer idUsuario) {
        Internacion internacion = internacionRepository.findById(idInternacion)
                .orElseThrow(() -> new InternacionNoEncontradaException(idInternacion));

        if (internacion.getFechaFin() != null) {
            throw new OperacionNoPermitidaException("La internación ya fue cerrada.");
        }

        HabitacionInternacion destino = habitacionRepository.findById(dto.getIdHabitacionDestino())
                .orElseThrow(() -> new RuntimeException("Habitación destino no encontrada"));

        if (!"disponible".equals(destino.getEstadoHabitacion())) {
            throw new HabitacionNoDisponibleException(destino.getNumeroHabitacion());
        }

        HabitacionInternacion origen = internacion.getHabitacion();
        origen.setEstadoHabitacion("disponible");
        habitacionRepository.save(origen);

        destino.setEstadoHabitacion("ocupada");
        habitacionRepository.save(destino);

        internacion.setHabitacion(destino);
        internacion.setCantidadTraslados(internacion.getCantidadTraslados() + 1);
        internacionRepository.save(internacion);

        registrarEventoAuto("Traslado de habitación", buildDescTrasladar(origen, destino, dto), internacion.getHistorial(), idUsuario);
    }

    @Override
    @Transactional
    public void egresarPaciente(Integer idInternacion, EgresoRequestDTO dto, Integer idUsuario) {
        Internacion internacion = internacionRepository.findById(idInternacion)
                .orElseThrow(() -> new InternacionNoEncontradaException(idInternacion));

        if (internacion.getFechaFin() != null) {
            throw new OperacionNoPermitidaException("La internación ya fue cerrada.");
        }

        internacion.setFechaFin(LocalDateTime.now());
        internacionRepository.save(internacion);

        HabitacionInternacion habitacion = internacion.getHabitacion();
        habitacion.setEstadoHabitacion("disponible");
        habitacionRepository.save(habitacion);

        HistorialMedico historial = internacion.getHistorial();
        historial.setFechaActualizacion(LocalDateTime.now());
        historialRepository.save(historial);

        registrarEventoAuto("Alta médica", buildDescEgresar(dto), historial, idUsuario);
    }

    private void registrarEventoAuto(String nombreTipo, String descripcion, HistorialMedico historial, Integer idUsuario) {
        tipoRepository.findByNombreTipoProcedimiento(nombreTipo).ifPresent(tipo -> {
            usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
                registroRepository.save(RegistroClinico.builder()
                        .descripcion(descripcion)
                        .fechaRegistro(LocalDateTime.now())
                        .historial(historial)
                        .tipoProcedimiento(tipo)
                        .usuario(usuario)
                        .build());
                historial.setFechaActualizacion(LocalDateTime.now());
                historialRepository.save(historial);
            });
        });
    }

    private String buildDescInternar(HabitacionInternacion hab, InternacionRequestDTO dto) {
        StringBuilder sb = new StringBuilder("Internación en habitación ").append(hab.getNumeroHabitacion())
                .append(", piso ").append(hab.getPisoHabitacion()).append(".");
        if (dto.getMotivo() != null && !dto.getMotivo().isBlank())
            sb.append(" Motivo: ").append(dto.getMotivo().trim()).append(".");
        if (dto.getObservaciones() != null && !dto.getObservaciones().isBlank())
            sb.append(" Observaciones: ").append(dto.getObservaciones().trim()).append(".");
        return sb.toString();
    }

    private String buildDescTrasladar(HabitacionInternacion origen, HabitacionInternacion destino, TrasladoRequestDTO dto) {
        StringBuilder sb = new StringBuilder("Traslado de habitación ")
                .append(origen.getNumeroHabitacion()).append(" (piso ").append(origen.getPisoHabitacion()).append(")")
                .append(" a habitación ")
                .append(destino.getNumeroHabitacion()).append(" (piso ").append(destino.getPisoHabitacion()).append(").");;
        if (dto.getMotivo() != null && !dto.getMotivo().isBlank())
            sb.append(" Motivo: ").append(dto.getMotivo().trim()).append(".");
        if (dto.getObservaciones() != null && !dto.getObservaciones().isBlank())
            sb.append(" Observaciones: ").append(dto.getObservaciones().trim()).append(".");
        return sb.toString();
    }

    private String buildDescEgresar(EgresoRequestDTO dto) {
        StringBuilder sb = new StringBuilder("Alta médica.");
        if (dto.getObservaciones() != null && !dto.getObservaciones().isBlank())
            sb.append(" Observaciones: ").append(dto.getObservaciones().trim()).append(".");
        return sb.toString();
    }

    private HabitacionResponseDTO mapear(HabitacionInternacion h) {
        HabitacionResponseDTO.PacienteOcupanteDTO pacienteDTO = null;
        HabitacionResponseDTO.InternacionActualDTO internacionDTO = null;

        if ("ocupada".equals(h.getEstadoHabitacion())) {
            var internacionOpt = internacionRepository.encontrarActivaPorHabitacion(h);
            if (internacionOpt.isPresent()) {
                Internacion i = internacionOpt.get();
                Paciente p = i.getHistorial().getPaciente();
                pacienteDTO = HabitacionResponseDTO.PacienteOcupanteDTO.builder()
                        .id(p.getIdPaciente())
                        .nombreCompleto(p.getPersona().getNombrePersona() + " " + p.getPersona().getApellidoPersona())
                        .dni(p.getDni())
                        .build();
                internacionDTO = HabitacionResponseDTO.InternacionActualDTO.builder()
                        .id(i.getId())
                        .fechaInicio(i.getFechaInicio().toString())
                        .cantidadTraslados(i.getCantidadTraslados())
                        .build();
            }
        }

        return HabitacionResponseDTO.builder()
                .id(h.getId())
                .numeroHabitacion(h.getNumeroHabitacion())
                .pisoHabitacion(h.getPisoHabitacion())
                .estadoHabitacion(h.getEstadoHabitacion())
                .pacienteActual(pacienteDTO)
                .internacionActual(internacionDTO)
                .build();
    }
}
