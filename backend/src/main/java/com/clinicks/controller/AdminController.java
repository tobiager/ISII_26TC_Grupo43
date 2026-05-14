package com.clinicks.controller;

import com.clinicks.dto.admin.AdminUsuarioDTO;
import com.clinicks.dto.admin.CambiarRolRequestDTO;
import com.clinicks.dto.admin.ResetPasswordResponseDTO;
import com.clinicks.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users — lista todos los usuarios
    @GetMapping("/users")
    public ResponseEntity<List<AdminUsuarioDTO>> listarUsuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    // PATCH /api/admin/users/{id}/role — cambia rol de un usuario
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUsuarioDTO> cambiarRol(
            @PathVariable Integer id,
            @Valid @RequestBody CambiarRolRequestDTO request) {
        return ResponseEntity.ok(adminService.cambiarRol(id, request));
    }

    // PATCH /api/admin/users/{id}/disable — baja lógica
    @PatchMapping("/users/{id}/disable")
    public ResponseEntity<AdminUsuarioDTO> desactivarUsuario(
            @PathVariable Integer id,
            @AuthenticationPrincipal String emailSolicitante) {
        return ResponseEntity.ok(adminService.desactivarUsuario(id, emailSolicitante));
    }

    // PATCH /api/admin/users/{id}/enable — reactiva usuario
    @PatchMapping("/users/{id}/enable")
    public ResponseEntity<AdminUsuarioDTO> activarUsuario(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.activarUsuario(id));
    }

    // PATCH /api/admin/users/{id}/reset-password — resetea contraseña a temporal
    @PatchMapping("/users/{id}/reset-password")
    public ResponseEntity<ResetPasswordResponseDTO> resetearPassword(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.resetearPassword(id));
    }
}
