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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialServiceImpl implements HistorialService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final PacienteRepository          pacienteRepository;
    private final HistorialMedicoRepository   historialRepository;
    private final RegistroClinicoRepository   registroRepository;
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
                    .estadoHistorial("activo")
                    .build();
        }

        List<RegistroClinicoResponseDTO> registros =
                registroRepository.findAllByHistorialOrderByFechaRegistroDesc(historial)
                        .stream()
                        .map(this::mapearRegistro)
                        .collect(Collectors.toList());

        return HistorialDetalleResponseDTO.builder()
                .id(historial.getIdHistorial())
                .fechaCreacion(historial.getFechaCreacion() != null ? historial.getFechaCreacion().format(FMT) : null)
                .fechaActualizacion(historial.getFechaActualizacion() != null ? historial.getFechaActualizacion().format(FMT) : null)
                .observaciones(historial.getObservaciones())
                .estadoHistorial(historial.getEstadoHistorial())
                .registros(registros)
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
