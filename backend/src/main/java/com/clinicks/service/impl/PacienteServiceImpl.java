package com.clinicks.service.impl;

import com.clinicks.dto.ContactoEmergenciaDTO;
import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.exception.DniDuplicadoException;
import com.clinicks.exception.PacienteNotFoundException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import com.clinicks.service.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository             pacienteRepository;
    private final ObraSocialRepository           obraSocialRepository;
    private final AfiliacionObraSocialRepository afiliacionRepository;
    private final TelefonoRepository             telefonoRepository;
    private final AlergiaRepository              alergiaRepository;
    private final EnfermedadCronicaRepository    enfermedadCronicaRepository;
    private final AntecedenteFamiliarRepository  antecedenteFamiliarRepository;
    private final ContactoEmergenciaRepository   contactoEmergenciaRepository;
    private final LocalidadRepository            localidadRepository;
    private final HistorialMedicoRepository      historialMedicoRepository;

    // ─── LISTAR ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> getAllPacientes() {
        return pacienteRepository.findAllActivePatientsWithDetails()
                .stream()
                .map(this::mapProjectionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> getDeletedPacientes() {
        return pacienteRepository.findAllDeletedPatientsWithDetails()
                .stream()
                .map(this::mapProjectionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDTO getPacienteById(Integer id) {
        Paciente paciente = getActivePaciente(id);
        return mapPacienteToDTO(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeDni(Integer dni, Integer excluirId) {
        if (excluirId != null) {
            return pacienteRepository.existsByDniAndIdPacienteNot(dni, excluirId);
        }
        return pacienteRepository.existsByDni(dni);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeAfiliado(String nroAfiliado, Integer idObraSocial, String nombreObraSocial, Integer excluirId) {
        if (!StringUtils.hasText(nroAfiliado)) return false;
        
        if (idObraSocial != null) {
            return pacienteRepository.existsByAfiliacionAndObraSocialId(nroAfiliado, idObraSocial, excluirId);
        } else if (StringUtils.hasText(nombreObraSocial)) {
            return pacienteRepository.existsByAfiliacionAndObraSocialNombre(nroAfiliado, nombreObraSocial.trim(), excluirId);
        }
        return false;
    }

    private void validarAfiliadoUnico(PacienteRequestDTO dto, Integer idExcluir) {
        if (existeAfiliado(dto.getNroAfiliado(), dto.getIdObraSocial(), dto.getNombreObraSocial(), idExcluir)) {
            throw new com.clinicks.exception.AfiliadoDuplicadoException(dto.getNroAfiliado());
        }
    }

    // ─── CREAR ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PacienteResponseDTO createPaciente(PacienteRequestDTO dto) {
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new DniDuplicadoException(dto.getDni());
        }

        validarAfiliadoUnico(dto, null);

        Persona persona = Persona.builder()
                .nombrePersona(dto.getNombre().trim())
                .apellidoPersona(dto.getApellido().trim())
                .fechaNacimiento(dto.getFechaNacimiento().atStartOfDay())
                .build();

        FichaMedica fichaMedica = FichaMedica.builder()
                .tipoSangre(dto.getTipoSangre())
                .antecedentesText(dto.getAntecedentesText())
                .build();

        Localidad localidad = resolveLocalidad(dto.getIdLocalidad());

        Domicilio domicilio = Domicilio.builder()
                .calle(StringUtils.hasText(dto.getDireccion()) ? dto.getDireccion().trim() : "Sin dirección")
                .numero(dto.getNumeroDireccion() != null ? dto.getNumeroDireccion() : 0)
                .piso(dto.getPiso())
                .localidad(localidad)
                .build();

        String tipoResidencia = StringUtils.hasText(dto.getTipoResidencia())
                ? dto.getTipoResidencia() : "permanente";

        Residencia residencia = Residencia.builder()
                .tipoResidencia(tipoResidencia)
                .domicilio(domicilio)
                .build();

        Paciente paciente = Paciente.builder()
                .dni(dto.getDni())
                .deletedAt(null)
                .persona(persona)
                .fichaMedica(fichaMedica)
                .residencia(residencia)
                .afiliacion(resolveAfiliacion(dto))
                .build();

        Paciente saved = pacienteRepository.save(paciente);

        FichaMedica ficha = saved.getFichaMedica();
        populateAlergias(ficha, dto.getAlergias());
        populateEnfermedades(ficha, dto.getEnfermedadesCronicas());
        populateAntecedentes(ficha, dto.getAntecedentesFamiliares());
        pacienteRepository.save(saved);

        saveTelefono(saved, dto.getTelefono(), dto.getTipoTelefono());
        saveContactosEmergencia(saved, dto.getContactosEmergencia());

        // Inicializar historial médico automáticamente al crear paciente
        if (!historialMedicoRepository.existsByPaciente(saved)) {
            historialMedicoRepository.save(HistorialMedico.builder()
                    .paciente(saved)
                    .estadoHistorial("activo")
                    .fechaCreacion(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .build());
        }

        return mapPacienteToDTO(saved);
    }

    // ─── ACTUALIZAR ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PacienteResponseDTO updatePaciente(Integer id, PacienteRequestDTO dto) {
        Paciente paciente = getActivePaciente(id);

        if (pacienteRepository.existsByDniAndIdPacienteNot(dto.getDni(), id)) {
            throw new DniDuplicadoException(dto.getDni());
        }

        validarAfiliadoUnico(dto, id);

        Persona persona = paciente.getPersona();
        if (StringUtils.hasText(dto.getNombre())) {
            persona.setNombrePersona(dto.getNombre().trim());
        }
        if (StringUtils.hasText(dto.getApellido())) {
            persona.setApellidoPersona(dto.getApellido().trim());
        }
        if (dto.getFechaNacimiento() != null) {
            persona.setFechaNacimiento(dto.getFechaNacimiento().atStartOfDay());
        }

        FichaMedica ficha = paciente.getFichaMedica();
        if (StringUtils.hasText(dto.getTipoSangre())) {
            ficha.setTipoSangre(dto.getTipoSangre());
        }
        ficha.setAntecedentesText(dto.getAntecedentesText());

        ficha.getAlergias().clear();
        ficha.getEnfermedadesCronicas().clear();
        ficha.getAntecedentesFamiliares().clear();
        populateAlergias(ficha, dto.getAlergias());
        populateEnfermedades(ficha, dto.getEnfermedadesCronicas());
        populateAntecedentes(ficha, dto.getAntecedentesFamiliares());

        if (paciente.getResidencia() != null && paciente.getResidencia().getDomicilio() != null) {
            Domicilio domicilio = paciente.getResidencia().getDomicilio();
            if (StringUtils.hasText(dto.getDireccion())) {
                domicilio.setCalle(dto.getDireccion().trim());
            }
            if (dto.getNumeroDireccion() != null) {
                domicilio.setNumero(dto.getNumeroDireccion());
            }
            domicilio.setPiso(dto.getPiso());
            domicilio.setLocalidad(resolveLocalidad(dto.getIdLocalidad()));

            if (StringUtils.hasText(dto.getTipoResidencia())) {
                paciente.getResidencia().setTipoResidencia(dto.getTipoResidencia());
            }
        }

        paciente.setDni(dto.getDni());
        paciente.setAfiliacion(resolveAfiliacion(dto));

        Paciente saved = pacienteRepository.save(paciente);

        telefonoRepository.deleteAllByPaciente(saved);
        saveTelefono(saved, dto.getTelefono(), dto.getTipoTelefono());

        contactoEmergenciaRepository.deleteAllByPaciente(saved);
        saveContactosEmergencia(saved, dto.getContactosEmergencia());

        return mapPacienteToDTO(saved);
    }

    // ─── SOFT DELETE ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deletePaciente(Integer id) {
        Paciente paciente = getActivePaciente(id);
        paciente.setDeletedAt(OffsetDateTime.now());
        pacienteRepository.save(paciente);
    }

    // ─── RESTAURAR ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void restaurarPaciente(Integer id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));
        paciente.setDeletedAt(null);
        pacienteRepository.save(paciente);
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    private Paciente getActivePaciente(Integer id) {
        return pacienteRepository.findByIdPacienteAndDeletedAtIsNull(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));
    }

    private void populateAlergias(FichaMedica ficha, List<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return;
        for (String nombre : nombres) {
            String t = nombre.trim();
            if (t.isEmpty()) continue;
            Alergia alergia = alergiaRepository.findByNombreAlergiaIgnoreCase(t)
                    .orElseGet(() -> alergiaRepository.save(
                            Alergia.builder().nombreAlergia(t).build()));
            ficha.getAlergias().add(alergia);
        }
    }

    private void populateEnfermedades(FichaMedica ficha, List<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return;
        for (String nombre : nombres) {
            String t = nombre.trim();
            if (t.isEmpty()) continue;
            EnfermedadCronica ec = enfermedadCronicaRepository.findByNombreEnfermedadIgnoreCase(t)
                    .orElseGet(() -> enfermedadCronicaRepository.save(
                            EnfermedadCronica.builder().nombreEnfermedad(t).build()));
            ficha.getEnfermedadesCronicas().add(ec);
        }
    }

    private void populateAntecedentes(FichaMedica ficha, List<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return;
        for (String nombre : nombres) {
            String t = nombre.trim();
            if (t.isEmpty()) continue;
            AntecedenteFamiliar af = antecedenteFamiliarRepository.findByNombreEnfermedadIgnoreCase(t)
                    .orElseGet(() -> antecedenteFamiliarRepository.save(
                            AntecedenteFamiliar.builder().nombreEnfermedad(t).build()));
            ficha.getAntecedentesFamiliares().add(af);
        }
    }

    private Localidad resolveLocalidad(Integer idLocalidad) {
        if (idLocalidad != null) {
            return localidadRepository.findById(idLocalidad).orElse(null);
        }
        return localidadRepository.findAll().stream().findFirst().orElse(null);
    }

    private AfiliacionObraSocial resolveAfiliacion(PacienteRequestDTO dto) {
        ObraSocial obraSocial = null;

        if (dto.getIdObraSocial() != null) {
            obraSocial = obraSocialRepository.findById(dto.getIdObraSocial()).orElse(null);
        } else if (StringUtils.hasText(dto.getNombreObraSocial())) {
            String nombre = dto.getNombreObraSocial().trim();
            obraSocial = obraSocialRepository
                    .findByNombreObraIgnoreCase(nombre)
                    .orElseGet(() -> obraSocialRepository.save(
                            ObraSocial.builder().nombreObra(nombre).build()
                    ));
        }

        if (obraSocial == null) return null;

        String nro = StringUtils.hasText(dto.getNroAfiliado())
                ? dto.getNroAfiliado().trim()
                : obraSocial.getNombreObra().toUpperCase().replaceAll("\\s+", "-") + "-" + dto.getDni();

        ObraSocial finalOS = obraSocial;
        LocalDate vencimiento = dto.getFechaVencimientoAfiliacion();

        return afiliacionRepository.findByNumeroAfiliadoAndObraSocial(nro, finalOS)
                .map(existing -> {
                    existing.setFechaVencimiento(vencimiento);
                    return afiliacionRepository.save(existing);
                })
                .orElseGet(() -> afiliacionRepository.save(
                        AfiliacionObraSocial.builder()
                                .numeroAfiliado(nro)
                                .fechaAlta(LocalDate.now())
                                .fechaVencimiento(vencimiento)
                                .obraSocial(finalOS)
                                .build()
                ));
    }

    private void saveTelefono(Paciente paciente, String numero, String tipo) {
        if (!StringUtils.hasText(numero)) return;
        String tipoFinal = StringUtils.hasText(tipo) ? tipo : "personal";
        telefonoRepository.save(Telefono.builder()
                .numeroTelefono(numero.trim())
                .tipoTelefono(tipoFinal)
                .paciente(paciente)
                .build());
    }

    private void saveContactosEmergencia(Paciente paciente, List<ContactoEmergenciaDTO> contactos) {
        if (contactos == null || contactos.isEmpty()) return;
        for (ContactoEmergenciaDTO c : contactos) {
            if (!StringUtils.hasText(c.getNombre()) && !StringUtils.hasText(c.getTelefono())) continue;
            contactoEmergenciaRepository.save(ContactoEmergencia.builder()
                    .paciente(paciente)
                    .nombreCompleto(StringUtils.hasText(c.getNombre()) ? c.getNombre().trim() : "Sin nombre")
                    .parentesco(StringUtils.hasText(c.getParentesco()) ? c.getParentesco().trim() : "Sin parentesco")
                    .telefonoCelular(StringUtils.hasText(c.getTelefono()) ? c.getTelefono().trim() : "Sin teléfono")
                    .build());
        }
    }

    // ─── MAPPERS ───────────────────────────────────────────────────────────────

    private PacienteResponseDTO mapProjectionToDTO(PacienteRepository.PacienteResumenProjection p) {
        LocalDate fechaNacimiento = p.getFechaNacimiento() != null
                ? p.getFechaNacimiento().toLocalDateTime().toLocalDate()
                : null;
        LocalDate ultimaVisita = p.getUltimaVisita() != null
                ? p.getUltimaVisita().toLocalDateTime().toLocalDate()
                : null;

        return PacienteResponseDTO.builder()
                .id(p.getIdPaciente())
                .nombre(p.getNombrePersona())
                .apellido(p.getApellidoPersona())
                .nombreCompleto(p.getNombrePersona() + " " + p.getApellidoPersona())
                .dni(p.getDni())
                .edad(calcularEdad(fechaNacimiento))
                .fechaNacimiento(fechaNacimiento)
                .tipoSangre(p.getTipoSangre())
                .alergias(parseAlergias(p.getAlergias()))
                .obraSocial(p.getNombreObra())
                .idObraSocial(p.getIdObraSocial())
                .nroAfiliado(p.getNroAfiliado())
                .estado(p.getEstado() != null ? p.getEstado() : "Ambulatorio")
                .numeroHabitacion(p.getNumeroHabitacion())
                .ultimaVisita(ultimaVisita)
                .contactosEmergencia(Collections.emptyList())
                .build();
    }

    private PacienteResponseDTO mapPacienteToDTO(Paciente p) {
        LocalDate fechaNacimiento = p.getPersona().getFechaNacimiento() != null
                ? p.getPersona().getFechaNacimiento().toLocalDate()
                : null;

        FichaMedica ficha = p.getFichaMedica();

        List<String> alergias = ficha.getAlergias().stream()
                .map(Alergia::getNombreAlergia)
                .sorted()
                .collect(Collectors.toList());

        List<String> enfermedades = ficha.getEnfermedadesCronicas().stream()
                .map(EnfermedadCronica::getNombreEnfermedad)
                .sorted()
                .collect(Collectors.toList());

        List<String> antecedentes = ficha.getAntecedentesFamiliares().stream()
                .map(AntecedenteFamiliar::getNombreEnfermedad)
                .sorted()
                .collect(Collectors.toList());

        Telefono tel = telefonoRepository.findByPaciente(p).stream().findFirst().orElse(null);

        List<ContactoEmergenciaDTO> contactos = contactoEmergenciaRepository.findByPaciente(p)
                .stream()
                .map(c -> ContactoEmergenciaDTO.builder()
                        .nombre(c.getNombreCompleto())
                        .telefono(c.getTelefonoCelular())
                        .parentesco(c.getParentesco())
                        .build())
                .collect(Collectors.toList());

        Domicilio dom = p.getResidencia() != null ? p.getResidencia().getDomicilio() : null;
        String calle      = dom != null ? dom.getCalle() : null;
        Integer numDir    = dom != null ? dom.getNumero() : null;
        Integer piso      = dom != null ? dom.getPiso() : null;
        Localidad localidad = dom != null ? dom.getLocalidad() : null;
        Provincia provincia = localidad != null ? localidad.getProvincia() : null;
        String tipoResidencia = p.getResidencia() != null ? p.getResidencia().getTipoResidencia() : null;

        AfiliacionObraSocial afl = p.getAfiliacion();
        ObraSocial os = afl != null ? afl.getObraSocial() : null;

        return PacienteResponseDTO.builder()
                .id(p.getIdPaciente())
                .nombre(p.getPersona().getNombrePersona())
                .apellido(p.getPersona().getApellidoPersona())
                .nombreCompleto(p.getPersona().getNombrePersona() + " " + p.getPersona().getApellidoPersona())
                .dni(p.getDni())
                .edad(calcularEdad(fechaNacimiento))
                .fechaNacimiento(fechaNacimiento)
                .tipoSangre(ficha.getTipoSangre())
                .alergias(alergias)
                .enfermedadesCronicas(enfermedades)
                .antecedentesFamiliares(antecedentes)
                .antecedentesText(ficha.getAntecedentesText())
                .obraSocial(os != null ? os.getNombreObra() : null)
                .idObraSocial(os != null ? os.getIdObraSocial() : null)
                .nroAfiliado(afl != null ? afl.getNumeroAfiliado() : null)
                .fechaVencimientoAfiliacion(afl != null ? afl.getFechaVencimiento() : null)
                .estado("Ambulatorio")
                .telefono(tel != null ? tel.getNumeroTelefono() : null)
                .tipoTelefono(tel != null ? tel.getTipoTelefono() : null)
                .direccion(calle)
                .numeroDireccion(numDir)
                .piso(piso)
                .tipoResidencia(tipoResidencia)
                .idLocalidad(localidad != null ? localidad.getIdLocalidad() : null)
                .nombreLocalidad(localidad != null ? localidad.getNombreLocalidad() : null)
                .idProvincia(provincia != null ? provincia.getIdProvincia() : null)
                .nombreProvincia(provincia != null ? provincia.getNombreProvincia() : null)
                .contactosEmergencia(contactos)
                .build();
    }

    private int calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return 0;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    private List<String> parseAlergias(String csv) {
        if (!StringUtils.hasText(csv)) return Collections.emptyList();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
