package com.clinicks.service;

import com.clinicks.dto.perfil.CambiarDatosBasicosRequestDTO;
import com.clinicks.dto.perfil.CambiarEmailRequestDTO;
import com.clinicks.dto.perfil.CambiarPasswordRequestDTO;
import com.clinicks.dto.perfil.PerfilResponseDTO;

public interface PerfilService {
    PerfilResponseDTO obtenerPerfil(String email);
    PerfilResponseDTO cambiarEmail(String emailActual, CambiarEmailRequestDTO request);
    PerfilResponseDTO cambiarPassword(String email, CambiarPasswordRequestDTO request);
    PerfilResponseDTO cambiarDatosBasicos(String email, CambiarDatosBasicosRequestDTO request);
}
