package com.clinicks.controller;

import com.clinicks.dto.habitacion.EgresoRequestDTO;
import com.clinicks.dto.habitacion.HabitacionResponseDTO;
import com.clinicks.dto.habitacion.InternacionRequestDTO;
import com.clinicks.dto.habitacion.TrasladoRequestDTO;
import com.clinicks.model.Usuario;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.service.HabitacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HabitacionController {

    private final HabitacionService  habitacionService;
    private final UsuarioRepository  usuarioRepository;

    @GetMapping("/habitaciones")
    public ResponseEntity<List<HabitacionResponseDTO>> listar() {
        return ResponseEntity.ok(habitacionService.listarHabitaciones());
    }

    @PostMapping("/habitaciones/{id}/internar")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR','ENFERMERO')")
    public ResponseEntity<Map<String, String>> internar(
            @PathVariable Integer id,
            @RequestBody InternacionRequestDTO dto,
            Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmailActivo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        habitacionService.internarPaciente(id, dto, usuario.getIdUsuario());
        return ResponseEntity.ok(Map.of("mensaje", "Paciente internado correctamente"));
    }

    @PostMapping("/internaciones/{id}/trasladar")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR','ENFERMERO')")
    public ResponseEntity<Map<String, String>> trasladar(
            @PathVariable Integer id,
            @RequestBody TrasladoRequestDTO dto,
            Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmailActivo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        habitacionService.trasladarPaciente(id, dto, usuario.getIdUsuario());
        return ResponseEntity.ok(Map.of("mensaje", "Paciente trasladado correctamente"));
    }

    @PostMapping("/internaciones/{id}/egresar")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR','ENFERMERO')")
    public ResponseEntity<Map<String, String>> egresar(
            @PathVariable Integer id,
            @RequestBody EgresoRequestDTO dto,
            Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmailActivo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        habitacionService.egresarPaciente(id, dto, usuario.getIdUsuario());
        return ResponseEntity.ok(Map.of("mensaje", "Paciente egresado correctamente"));
    }

    @PatchMapping("/habitaciones/{id}/estado")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR','ENFERMERO')")
    public ResponseEntity<Map<String, String>> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        habitacionService.cambiarEstadoHabitacion(id, estado);
        return ResponseEntity.ok(Map.of("mensaje", "Estado de habitación actualizado correctamente"));
    }
}
