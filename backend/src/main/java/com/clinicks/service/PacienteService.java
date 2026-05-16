package com.clinicks.service;

import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;

import java.util.List;

public interface PacienteService {

    List<PacienteResponseDTO> obtenerTodosLosPacientes();

    List<PacienteResponseDTO> obtenerPacientesEliminados();

    PacienteResponseDTO obtenerPacientePorId(Integer id);

    PacienteResponseDTO crearPaciente(PacienteRequestDTO dto);

    PacienteResponseDTO actualizarPaciente(Integer id, PacienteRequestDTO dto);

    void eliminarPaciente(Integer id);

    void restaurarPaciente(Integer id);

    boolean existeDni(Integer dni, Integer excluirId);

    boolean existeAfiliado(String nroAfiliado, Integer idObraSocial, String nombreObraSocial, Integer excluirId);
}
