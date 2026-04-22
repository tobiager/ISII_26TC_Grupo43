package com.clinicks.controller;

import com.clinicks.repository.ObraSocialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/obras-sociales")
@RequiredArgsConstructor
public class ObraSocialController {

    private final ObraSocialRepository obraSocialRepository;

    // GET /api/obras-sociales — Lista todas las obras sociales
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> result = obraSocialRepository.findAll()
                .stream()
                .sorted((a, b) -> a.getNombreObra().compareToIgnoreCase(b.getNombreObra()))
                .map(os -> Map.<String, Object>of(
                        "id", os.getIdObraSocial(),
                        "nombre", os.getNombreObra()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
