package com.clinicks.service;

import com.clinicks.dto.habitacion.EgresoRequestDTO;
import com.clinicks.dto.habitacion.HabitacionResponseDTO;
import com.clinicks.dto.habitacion.InternacionRequestDTO;
import com.clinicks.dto.habitacion.TrasladoRequestDTO;

import java.util.List;

public interface HabitacionService {
    List<HabitacionResponseDTO> listarHabitaciones();
    void internarPaciente(Integer idHabitacion, InternacionRequestDTO dto, Integer idUsuario);
    void trasladarPaciente(Integer idInternacion, TrasladoRequestDTO dto, Integer idUsuario);
    void egresarPaciente(Integer idInternacion, EgresoRequestDTO dto, Integer idUsuario);
    void cambiarEstadoHabitacion(Integer idHabitacion, String nuevoEstado);
}
