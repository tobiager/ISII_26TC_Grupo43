package com.clinicks.controller;

import com.clinicks.dto.historial.HistorialDetalleResponseDTO;
import com.clinicks.dto.historial.RegistroClinicoRequestDTO;
import com.clinicks.dto.historial.TipoProcedimientoDTO;
import com.clinicks.model.Usuario;
import com.clinicks.repository.UsuarioRepository;
import com.clinicks.service.HistorialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final HistorialService    historialService;
    private final UsuarioRepository   usuarioRepository;

    @GetMapping("/tipos-procedimiento")
    public ResponseEntity<List<TipoProcedimientoDTO>> tiposProcedimiento() {
        return ResponseEntity.ok(historialService.listarTiposProcedimiento());
    }

    @GetMapping("/{idPaciente}")
    public ResponseEntity<HistorialDetalleResponseDTO> obtener(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(historialService.obtenerPorPaciente(idPaciente));
    }

    @PostMapping("/{idPaciente}/registros")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR','MEDICO','ENFERMERO')")
    public ResponseEntity<Map<String, String>> registrar(
            @PathVariable Integer idPaciente,
            @RequestBody RegistroClinicoRequestDTO dto,
            Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmailActivo(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        historialService.registrarEvento(idPaciente, dto, usuario.getIdUsuario());
        return ResponseEntity.ok(Map.of("mensaje", "Evento registrado correctamente"));
    }
}
