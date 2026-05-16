package com.clinicks.controller;

import com.clinicks.dto.auth.*;
import com.clinicks.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login — público
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/register — público (requiere token de invitación)
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    // GET /api/auth/me — requiere autenticación
    @GetMapping("/me")
    public ResponseEntity<LoginResponseDTO.UsuarioAuthDTO> me(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.me(email));
    }

    // GET /api/auth/invitations/validate?token=... — público
    @GetMapping("/invitations/validate")
    public ResponseEntity<ValidarTokenResponseDTO> validarToken(@RequestParam String token) {
        return ResponseEntity.ok(authService.validarToken(token));
    }

    // POST /api/auth/invitations — solo ADMINISTRADOR
    @PostMapping("/invitations")
    public ResponseEntity<InvitacionResponseDTO> crearInvitacion(
            @Valid @RequestBody InvitacionRequestDTO request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.crearInvitacion(request, email));
    }

    // GET /api/auth/invitations — solo ADMINISTRADOR
    @GetMapping("/invitations")
    public ResponseEntity<List<InvitacionResponseDTO>> listarInvitaciones() {
        return ResponseEntity.ok(authService.listarInvitaciones());
    }
}
