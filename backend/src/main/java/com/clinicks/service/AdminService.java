package com.clinicks.service;

import com.clinicks.dto.admin.AdminUsuarioDTO;
import com.clinicks.dto.admin.CambiarRolRequestDTO;

import java.util.List;

public interface AdminService {

    List<AdminUsuarioDTO> listarUsuarios();

    AdminUsuarioDTO cambiarRol(Integer idUsuario, CambiarRolRequestDTO request);

    AdminUsuarioDTO desactivarUsuario(Integer idUsuario, String emailSolicitante);

    AdminUsuarioDTO activarUsuario(Integer idUsuario);
}
