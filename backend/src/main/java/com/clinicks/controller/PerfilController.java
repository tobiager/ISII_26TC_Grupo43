package com.clinicks.controller;

import com.clinicks.dto.perfil.CambiarDatosBasicosRequestDTO;
import com.clinicks.dto.perfil.CambiarEmailRequestDTO;
import com.clinicks.dto.perfil.CambiarPasswordRequestDTO;
import com.clinicks.dto.perfil.PerfilResponseDTO;
import com.clinicks.service.PerfilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilService perfilService;

    @GetMapping
    public ResponseEntity<PerfilResponseDTO> obtenerPerfil(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(perfilService.obtenerPerfil(email));
    }

    @PatchMapping("/email")
    public ResponseEntity<PerfilResponseDTO> cambiarEmail(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CambiarEmailRequestDTO request) {
        return ResponseEntity.ok(perfilService.cambiarEmail(email, request));
    }

    @PatchMapping("/password")
    public ResponseEntity<PerfilResponseDTO> cambiarPassword(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CambiarPasswordRequestDTO request) {
        return ResponseEntity.ok(perfilService.cambiarPassword(email, request));
    }

    @PatchMapping("/basic-data")
    public ResponseEntity<PerfilResponseDTO> cambiarDatosBasicos(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CambiarDatosBasicosRequestDTO request) {
        return ResponseEntity.ok(perfilService.cambiarDatosBasicos(email, request));
    }
}
