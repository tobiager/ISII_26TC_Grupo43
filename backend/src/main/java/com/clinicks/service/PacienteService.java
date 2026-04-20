package com.clinicks.service;

import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;

import java.util.List;

public interface PacienteService {

    List<PacienteResponseDTO> getAllPacientes();

    List<PacienteResponseDTO> getDeletedPacientes();

    PacienteResponseDTO getPacienteById(Integer id);

    PacienteResponseDTO createPaciente(PacienteRequestDTO dto);

    PacienteResponseDTO updatePaciente(Integer id, PacienteRequestDTO dto);

    void deletePaciente(Integer id);

    void restaurarPaciente(Integer id);
}
