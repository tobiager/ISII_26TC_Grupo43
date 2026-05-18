package com.clinicks.service;

import com.clinicks.dto.historial.HistorialDetalleResponseDTO;
import com.clinicks.dto.historial.RegistroClinicoRequestDTO;
import com.clinicks.dto.historial.TipoProcedimientoDTO;

import java.util.List;

public interface HistorialService {
    HistorialDetalleResponseDTO obtenerPorPaciente(Integer idPaciente);
    void registrarEvento(Integer idPaciente, RegistroClinicoRequestDTO dto, Integer idUsuario);
    List<TipoProcedimientoDTO> listarTiposProcedimiento();
}
