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
    public ResponseEntity<List<PacienteResponseDTO>> obtenerTodosLosPacientes() {
        return ResponseEntity.ok(pacienteService.obtenerTodosLosPacientes());
    }

    // GET /api/pacientes/desactivados — Lista pacientes dados de baja (soft-deleted)
    @GetMapping("/desactivados")
    public ResponseEntity<List<PacienteResponseDTO>> obtenerPacientesEliminados() {
        return ResponseEntity.ok(pacienteService.obtenerPacientesEliminados());
    }

    // GET /api/pacientes/{id} — Detalle completo de un paciente (para edición)
    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> obtenerPacientePorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pacienteService.obtenerPacientePorId(id));
    }

    // POST /api/pacientes — Registrar nuevo paciente (transaccional: persona + ficha + residencia + paciente)
    @PostMapping
    public ResponseEntity<PacienteResponseDTO> crearPaciente(@Valid @RequestBody PacienteRequestDTO dto) {
        PacienteResponseDTO created = pacienteService.crearPaciente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/pacientes/{id} — Actualizar datos del paciente
    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> actualizarPaciente(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteRequestDTO dto) {
        return ResponseEntity.ok(pacienteService.actualizarPaciente(id, dto));
    }

    // DELETE /api/pacientes/{id} — Soft delete (activo = false)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarPaciente(@PathVariable Integer id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.ok(Map.of("mensaje", "Paciente dado de baja correctamente"));
    }

    // PATCH /api/pacientes/{id}/restaurar — Restaurar paciente dado de baja
    @PatchMapping("/{id}/restaurar")
    public ResponseEntity<Map<String, String>> restaurarPaciente(@PathVariable Integer id) {
        pacienteService.restaurarPaciente(id);
        return ResponseEntity.ok(Map.of("mensaje", "Paciente restaurado correctamente"));
    }

    // GET /api/pacientes/existe-dni?dni=&excluirId= — Verifica unicidad de DNI para validación en frontend
    @GetMapping("/existe-dni")
    public ResponseEntity<Map<String, Boolean>> existeDni(
            @RequestParam Integer dni,
            @RequestParam(required = false) Integer excluirId) {
        boolean existe = pacienteService.existeDni(dni, excluirId);
        return ResponseEntity.ok(Map.of("existe", existe));
    }

    // GET /api/pacientes/existe-afiliado — Verifica unicidad de Nro Afiliado por Obra Social
    @GetMapping("/existe-afiliado")
    public ResponseEntity<Map<String, Boolean>> existeAfiliado(
            @RequestParam String nroAfiliado,
            @RequestParam(required = false) Integer idObraSocial,
            @RequestParam(required = false) String nombreObraSocial,
            @RequestParam(required = false) Integer excluirId) {
        boolean existe = pacienteService.existeAfiliado(nroAfiliado, idObraSocial, nombreObraSocial, excluirId);
        return ResponseEntity.ok(Map.of("existe", existe));
    }
}

