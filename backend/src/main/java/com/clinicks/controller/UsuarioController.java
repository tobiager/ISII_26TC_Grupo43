package com.clinicks.controller;

import com.clinicks.dto.UsuarioResponseDTO;
import com.clinicks.exception.PacienteNoEncontradoException;
import com.clinicks.model.Usuario;
import com.clinicks.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    // GET /api/usuarios/{id} — Perfil de un usuario por ID (relación usuario → persona)
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Integer id) {
        Usuario usuario = usuarioRepository.encontrarPorIdUsuarioActivo(id)
                .orElseThrow(() -> new PacienteNoEncontradoException(id));
        return ResponseEntity.ok(convertirADto(usuario));
    }

    // GET /api/usuarios/perfil — Primer usuario activo (placeholder hasta implementar JWT)
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil() {
        Usuario usuario = usuarioRepository.encontrarPrimerUsuarioActivo()
                .orElseThrow(() -> new RuntimeException("No hay usuarios registrados"));
        return ResponseEntity.ok(convertirADto(usuario));
    }

    private UsuarioResponseDTO convertirADto(Usuario u) {
        String nombre   = u.getPersona().getNombrePersona();
        String apellido = u.getPersona().getApellidoPersona();
        String iniciales = String.valueOf(nombre.charAt(0)) + String.valueOf(apellido.charAt(0));
        return UsuarioResponseDTO.builder()
                .id(u.getIdUsuario())
                .email(u.getEmail())
                .nombre(nombre)
                .apellido(apellido)
                .nombreCompleto(nombre + " " + apellido)
                .iniciales(iniciales.toUpperCase())
                .rol(u.getRol().getNombreRol())
                .build();
    }
}
