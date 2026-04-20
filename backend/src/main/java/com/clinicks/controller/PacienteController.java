package com.clinicks.controller;

import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    // GET /api/pacientes — Lista todos los pacientes activos con estado calculado
    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> getAllPacientes() {
        return ResponseEntity.ok(pacienteService.getAllPacientes());
    }

    // GET /api/pacientes/desactivados — Lista pacientes dados de baja (soft-deleted)
    @GetMapping("/desactivados")
    public ResponseEntity<List<PacienteResponseDTO>> getDeletedPacientes() {
        return ResponseEntity.ok(pacienteService.getDeletedPacientes());
    }

    // GET /api/pacientes/{id} — Detalle completo de un paciente (para edición)
    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> getPacienteById(@PathVariable Integer id) {
        return ResponseEntity.ok(pacienteService.getPacienteById(id));
    }

    // POST /api/pacientes — Registrar nuevo paciente (transaccional: persona + ficha + residencia + paciente)
    @PostMapping
    public ResponseEntity<PacienteResponseDTO> createPaciente(@Valid @RequestBody PacienteRequestDTO dto) {
        PacienteResponseDTO created = pacienteService.createPaciente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/pacientes/{id} — Actualizar datos del paciente
    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> updatePaciente(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteRequestDTO dto) {
        return ResponseEntity.ok(pacienteService.updatePaciente(id, dto));
    }

    // DELETE /api/pacientes/{id} — Soft delete (activo = false)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePaciente(@PathVariable Integer id) {
        pacienteService.deletePaciente(id);
        return ResponseEntity.ok(Map.of("mensaje", "Paciente dado de baja correctamente"));
    }

    // PATCH /api/pacientes/{id}/restaurar — Restaurar paciente dado de baja
    @PatchMapping("/{id}/restaurar")
    public ResponseEntity<Map<String, String>> restaurarPaciente(@PathVariable Integer id) {
        pacienteService.restaurarPaciente(id);
        return ResponseEntity.ok(Map.of("mensaje", "Paciente restaurado correctamente"));
    }
}

