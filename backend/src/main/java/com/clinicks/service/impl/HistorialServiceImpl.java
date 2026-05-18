package com.clinicks.service.impl;

import com.clinicks.dto.historial.*;
import com.clinicks.exception.PacienteNoEncontradoException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import com.clinicks.service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialServiceImpl implements HistorialService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final PacienteRepository          pacienteRepository;
    private final HistorialMedicoRepository   historialRepository;
    private final RegistroClinicoRepository   registroRepository;
    private final InternacionRepository       internacionRepository;
    private final TipoProcedimientoRepository tipoRepository;
    private final UsuarioRepository           usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public HistorialDetalleResponseDTO obtenerPorPaciente(Integer idPaciente) {
        pacienteRepository.encontrarPacienteActivoPorId(idPaciente)
                .orElseThrow(() -> new PacienteNoEncontradoException(idPaciente));

        HistorialMedico historial = historialRepository.encontrarPorIdPaciente(idPaciente).orElse(null);

        if (historial == null) {
            return HistorialDetalleResponseDTO.builder()
                    .registros(Collections.emptyList())
                    .eventosAmbulatorios(Collections.emptyList())
                    .internaciones(Collections.emptyList())
                    .estadoHistorial("activo")
                    .build();
        }

        // Cargar todos los registros y las internaciones
        List<RegistroClinico> todosRegistros =
                registroRepository.findAllByHistorialOrderByFechaRegistroDesc(historial);

        List<Internacion> internaciones =
                internacionRepository.findAllByHistorialOrderByFechaInicioDesc(historial);

        // Mapear registros a DTOs (una sola vez)
        List<RegistroClinicoResponseDTO> todosRegistrosDTOs = todosRegistros.stream()
                .map(this::mapearRegistro)
                .collect(Collectors.toList());

        // Preparar mapa de eventos por internación
        Map<Integer, List<RegistroClinicoResponseDTO>> eventosPorInternacion = new HashMap<>();
        for (Internacion i : internaciones) {
            eventosPorInternacion.put(i.getId(), new ArrayList<>());
        }
        List<RegistroClinicoResponseDTO> eventosAmbulatorios = new ArrayList<>();

        // Agrupar cada registro en su internación o en ambulatorios
        for (int idx = 0; idx < todosRegistros.size(); idx++) {
            LocalDateTime fechaReg = todosRegistros.get(idx).getFechaRegistro();
            RegistroClinicoResponseDTO dto = todosRegistrosDTOs.get(idx);
            boolean asignado = false;

            for (Internacion i : internaciones) {
                boolean despuesDeInicio = !fechaReg.isBefore(i.getFechaInicio());
                boolean antesDeFinOActiva = i.getFechaFin() == null || !fechaReg.isAfter(i.getFechaFin());
                if (despuesDeInicio && antesDeFinOActiva) {
                    eventosPorInternacion.get(i.getId()).add(dto);
                    asignado = true;
                    break;
                }
            }

            if (!asignado) {
                eventosAmbulatorios.add(dto);
            }
        }

        // Construir DTOs de internación
        List<InternacionHistorialDTO> internacionDTOs = internaciones.stream()
                .map(i -> InternacionHistorialDTO.builder()
                        .idInternacion(i.getId())
                        .fechaInicio(i.getFechaInicio().format(FMT))
                        .fechaFin(i.getFechaFin() != null ? i.getFechaFin().format(FMT) : null)
                        .estado(i.getFechaFin() == null ? "ACTIVA" : "EGRESADA")
                        .numeroHabitacion(i.getHabitacion().getNumeroHabitacion())
                        .pisoHabitacion(i.getHabitacion().getPisoHabitacion())
                        .cantidadTraslados(i.getCantidadTraslados())
                        .eventos(eventosPorInternacion.getOrDefault(i.getId(), Collections.emptyList()))
                        .build())
                .collect(Collectors.toList());

        return HistorialDetalleResponseDTO.builder()
                .id(historial.getIdHistorial())
                .fechaCreacion(historial.getFechaCreacion() != null ? historial.getFechaCreacion().format(FMT) : null)
                .fechaActualizacion(historial.getFechaActualizacion() != null ? historial.getFechaActualizacion().format(FMT) : null)
                .observaciones(historial.getObservaciones())
                .estadoHistorial(historial.getEstadoHistorial())
                .registros(todosRegistrosDTOs)
                .eventosAmbulatorios(eventosAmbulatorios)
                .internaciones(internacionDTOs)
                .build();
    }

    @Override
    @Transactional
    public void registrarEvento(Integer idPaciente, RegistroClinicoRequestDTO dto, Integer idUsuario) {
        Paciente paciente = pacienteRepository.encontrarPacienteActivoPorId(idPaciente)
                .orElseThrow(() -> new PacienteNoEncontradoException(idPaciente));

        HistorialMedico historial = historialRepository.encontrarPorIdPaciente(idPaciente)
                .orElseGet(() -> historialRepository.save(HistorialMedico.builder()
                        .paciente(paciente)
                        .estadoHistorial("activo")
                        .fechaCreacion(LocalDateTime.now())
                        .fechaActualizacion(LocalDateTime.now())
                        .build()));

        TipoProcedimiento tipo = tipoRepository.findById(dto.getIdTipoProcedimiento())
                .orElseThrow(() -> new RuntimeException("Tipo de procedimiento no encontrado"));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        registroRepository.save(RegistroClinico.builder()
                .descripcion(dto.getDescripcion())
                .fechaRegistro(LocalDateTime.now())
                .historial(historial)
                .tipoProcedimiento(tipo)
                .usuario(usuario)
                .build());

        historial.setFechaActualizacion(LocalDateTime.now());
        historialRepository.save(historial);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoProcedimientoDTO> listarTiposProcedimiento() {
        return tipoRepository.findAll().stream()
                .map(t -> TipoProcedimientoDTO.builder()
                        .id(t.getId())
                        .nombre(t.getNombreTipoProcedimiento())
                        .build())
                .collect(Collectors.toList());
    }

    private RegistroClinicoResponseDTO mapearRegistro(RegistroClinico r) {
        return RegistroClinicoResponseDTO.builder()
                .id(r.getId())
                .descripcion(r.getDescripcion())
                .fechaRegistro(r.getFechaRegistro() != null ? r.getFechaRegistro().format(FMT) : null)
                .idTipoProcedimiento(r.getTipoProcedimiento().getId())
                .tipoProcedimiento(r.getTipoProcedimiento().getNombreTipoProcedimiento())
                .idUsuario(r.getUsuario().getIdUsuario())
                .usuarioNombre(r.getUsuario().getPersona().getNombrePersona() + " " + r.getUsuario().getPersona().getApellidoPersona())
                .usuarioRol(r.getUsuario().getRol().getNombreRol())
                .build();
    }
}
