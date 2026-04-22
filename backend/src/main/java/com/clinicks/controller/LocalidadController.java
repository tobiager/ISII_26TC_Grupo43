package com.clinicks.controller;

import com.clinicks.repository.LocalidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/localidades")
@RequiredArgsConstructor
public class LocalidadController {

    private final LocalidadRepository localidadRepository;

    // GET /api/localidades?provinciaId={id} — Localidades filtradas por provincia
    // GET /api/localidades — Todas las localidades (sin filtro)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getByProvincia(
            @RequestParam(required = false) Integer provinciaId) {

        var localidades = provinciaId != null
                ? localidadRepository.findByProvinciaIdProvinciaOrderByNombreLocalidadAsc(provinciaId)
                : localidadRepository.findAllByOrderByNombreLocalidadAsc();

        List<Map<String, Object>> result = localidades.stream()
                .map(l -> Map.<String, Object>of(
                        "id", l.getIdLocalidad(),
                        "nombre", l.getNombreLocalidad(),
                        "codigoPostal", l.getCodigoPostal(),
                        "idProvincia", l.getProvincia().getIdProvincia()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
