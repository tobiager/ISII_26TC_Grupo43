package com.clinicks.controller;

import com.clinicks.repository.ProvinciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/provincias")
@RequiredArgsConstructor
public class ProvinciaController {

    private final ProvinciaRepository provinciaRepository;

    // GET /api/provincias — Lista todas las provincias ordenadas alfabéticamente
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerTodas() {
        List<Map<String, Object>> result = provinciaRepository.encontrarTodasOrdenadasPorNombre()
                .stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getIdProvincia(),
                        "nombre", p.getNombreProvincia()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
