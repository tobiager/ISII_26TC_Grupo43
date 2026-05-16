package com.clinicks.service;

import com.clinicks.dto.auth.*;

import java.util.List;

public interface AuthService {

    LoginResponseDTO login(LoginRequestDTO request);

    LoginResponseDTO register(RegisterRequestDTO request);

    LoginResponseDTO.UsuarioAuthDTO me(String email);

    InvitacionResponseDTO crearInvitacion(InvitacionRequestDTO request, String emailCreador);

    List<InvitacionResponseDTO> listarInvitaciones();

    ValidarTokenResponseDTO validarToken(String token);
}
