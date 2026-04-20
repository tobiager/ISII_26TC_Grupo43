package com.clinicks.service.impl;

import com.clinicks.dto.PacienteRequestDTO;
import com.clinicks.dto.PacienteResponseDTO;
import com.clinicks.exception.DniDuplicadoException;
import com.clinicks.exception.PacienteNotFoundException;
import com.clinicks.model.*;
import com.clinicks.repository.*;
import com.clinicks.service.PacienteService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements PacienteService {

    @PersistenceContext
    private EntityManager entityManager;

    private final PacienteRepository                pacienteRepository;
    private final ObraSocialRepository              obraSocialRepository;
    private final AfiliacionObraSocialRepository    afiliacionRepository;
    private final TelefonoRepository                telefonoRepository;
    private final AlergiaRepository                 alergiaRepository;
    private final PacienteAlergiaRepository         antecedenteMedicoRepository;
    private final ContactoEmergenciaRepository      contactoEmergenciaRepository;
    private final LocalidadRepository               localidadRepository;

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

    // ─── CREAR ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PacienteResponseDTO createPaciente(PacienteRequestDTO dto) {
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new DniDuplicadoException(dto.getDni());
        }

        Persona persona = Persona.builder()
                .nombrePersona(dto.getNombre().trim())
                .apellidoPersona(dto.getApellido().trim())
                .fechaNacimiento(dto.getFechaNacimiento().atStartOfDay())
                .build();

        FichaMedica fichaMedica = FichaMedica.builder()
                .tipoSangre(dto.getTipoSangre())
                .antecedentesText(buildAntecedentesText(dto))
                .build();

        Localidad localidad = resolveLocalidad(dto.getIdLocalidad());

        Domicilio domicilio = Domicilio.builder()
                .calle(StringUtils.hasText(dto.getDireccion()) ? dto.getDireccion() : "Sin dirección")
                .numero(0)
                .localidad(localidad)
                .build();

        Residencia residencia = Residencia.builder()
                .tipoResidencia("permanente")
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

        saveAlergias(saved.getFichaMedica(), dto.getAlergias());
        saveTelefono(saved, dto.getTelefono());
        saveContactoEmergencia(saved, dto);

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
        ficha.setAntecedentesText(buildAntecedentesText(dto));

        if (paciente.getResidencia() != null && paciente.getResidencia().getDomicilio() != null) {
            Domicilio domicilio = paciente.getResidencia().getDomicilio();
            if (StringUtils.hasText(dto.getDireccion())) {
                domicilio.setCalle(dto.getDireccion());
            }
            Localidad localidad = resolveLocalidad(dto.getIdLocalidad());
            domicilio.setLocalidad(localidad);
        }

        paciente.setDni(dto.getDni());
        paciente.setAfiliacion(resolveAfiliacion(dto));

        Paciente saved = pacienteRepository.save(paciente);

        // Flush ensures DELETEs are sent to DB before INSERTs, avoiding unique constraint violations
        antecedenteMedicoRepository.deleteAllByFichaMedica(saved.getFichaMedica());
        entityManager.flush();
        saveAlergias(saved.getFichaMedica(), dto.getAlergias());

        telefonoRepository.deleteAllByPaciente(saved);
        entityManager.flush();
        saveTelefono(saved, dto.getTelefono());

        contactoEmergenciaRepository.deleteAllByPaciente(saved);
        entityManager.flush();
        saveContactoEmergencia(saved, dto);

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

    private String buildAntecedentesText(PacienteRequestDTO dto) {
        // Combina enfermedades crónicas y antecedente familiar en el campo texto
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(dto.getEnfermedadesCronicas())) {
            sb.append("Enf. crónicas: ").append(dto.getEnfermedadesCronicas().trim());
        }
        if (StringUtils.hasText(dto.getAntecedenteFamiliar())) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Antec. familiar: ").append(dto.getAntecedenteFamiliar().trim());
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    private Localidad resolveLocalidad(Integer idLocalidad) {
        if (idLocalidad != null) {
            return localidadRepository.findById(idLocalidad).orElse(null);
        }
        // Fallback: usar primera localidad disponible (domicilio NOT NULL en schema)
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

        // Si tiene número de afiliado, crear/reusar afiliación
        if (StringUtils.hasText(dto.getNroAfiliado())) {
            String nro = dto.getNroAfiliado().trim();
            ObraSocial finalObraSocial = obraSocial;
            return afiliacionRepository.findByNumeroAfiliado(nro)
                    .orElseGet(() -> afiliacionRepository.save(
                            AfiliacionObraSocial.builder()
                                    .numeroAfiliado(nro)
                                    .fechaAlta(LocalDate.now())
                                    .obraSocial(finalObraSocial)
                                    .build()
                    ));
        }

        // Obra social sin número de afiliado: generar número genérico único
        String nroGenerado = obraSocial.getNombreObra().toUpperCase().replaceAll("\\s+", "-")
                + "-" + dto.getDni();
        ObraSocial finalOS = obraSocial;
        return afiliacionRepository.findByNumeroAfiliado(nroGenerado)
                .orElseGet(() -> afiliacionRepository.save(
                        AfiliacionObraSocial.builder()
                                .numeroAfiliado(nroGenerado)
                                .fechaAlta(LocalDate.now())
                                .obraSocial(finalOS)
                                .build()
                ));
    }

    private void saveAlergias(FichaMedica fichaMedica, List<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return;
        for (String nombre : nombres) {
            String trimmed = nombre.trim();
            if (trimmed.isEmpty()) continue;
            Alergia alergia = alergiaRepository
                    .findByNombreAlergiaIgnoreCase(trimmed)
                    .orElseGet(() -> alergiaRepository.save(
                            Alergia.builder().nombreAlergia(trimmed).build()
                    ));
            antecedenteMedicoRepository.save(
                    PacienteAlergia.builder()
                            .fichaMedica(fichaMedica)
                            .alergia(alergia)
                            .build()
            );
        }
    }

    private void saveTelefono(Paciente paciente, String numero) {
        if (!StringUtils.hasText(numero)) return;
        telefonoRepository.save(Telefono.builder()
                .numeroTelefono(numero.trim())
                .tipoTelefono("personal")
                .paciente(paciente)
                .build());
    }

    private void saveContactoEmergencia(Paciente paciente, PacienteRequestDTO dto) {
        if (!StringUtils.hasText(dto.getContactoEmergenciaNombre())
                && !StringUtils.hasText(dto.getContactoEmergenciaTelefono())) return;

        contactoEmergenciaRepository.save(ContactoEmergencia.builder()
                .paciente(paciente)
                .nombreCompleto(StringUtils.hasText(dto.getContactoEmergenciaNombre())
                        ? dto.getContactoEmergenciaNombre().trim() : "Sin nombre")
                .parentesco(StringUtils.hasText(dto.getContactoEmergenciaParentesco())
                        ? dto.getContactoEmergenciaParentesco().trim() : "Sin parentesco")
                .telefonoCelular(StringUtils.hasText(dto.getContactoEmergenciaTelefono())
                        ? dto.getContactoEmergenciaTelefono().trim() : "Sin teléfono")
                .build());
    }

    // ─── MAPPERS ───────────────────────────────────────────────────────────────

    private PacienteResponseDTO mapProjectionToDTO(PacienteRepository.PacienteResumenProjection p) {
        LocalDate fechaNacimiento = p.getFechaNacimiento() != null
                ? p.getFechaNacimiento().toLocalDateTime().toLocalDate()
                : null;
        LocalDate ultimaVisita = p.getUltimaVisita() != null
                ? p.getUltimaVisita().toLocalDateTime().toLocalDate()
                : null;

        List<String> alergias = parseAlergias(p.getAlergias());

        return PacienteResponseDTO.builder()
                .id(p.getIdPaciente())
                .nombre(p.getNombrePersona())
                .apellido(p.getApellidoPersona())
                .nombreCompleto(p.getNombrePersona() + " " + p.getApellidoPersona())
                .dni(p.getDni())
                .edad(calcularEdad(fechaNacimiento))
                .fechaNacimiento(fechaNacimiento)
                .tipoSangre(p.getTipoSangre())
                .alergias(alergias)
                .obraSocial(p.getNombreObra())
                .idObraSocial(p.getIdObraSocial())
                .nroAfiliado(p.getNroAfiliado())
                .estado(p.getEstado() != null ? p.getEstado() : "Ambulatorio")
                .numeroHabitacion(p.getNumeroHabitacion())
                .ultimaVisita(ultimaVisita)
                .build();
    }

    private PacienteResponseDTO mapPacienteToDTO(Paciente p) {
        LocalDate fechaNacimiento = p.getPersona().getFechaNacimiento() != null
                ? p.getPersona().getFechaNacimiento().toLocalDate()
                : null;

        List<String> alergias = antecedenteMedicoRepository.findByFichaMedica(p.getFichaMedica())
                .stream()
                .filter(am -> am.getAlergia() != null)
                .map(am -> am.getAlergia().getNombreAlergia())
                .collect(Collectors.toList());

        String telPersonal = telefonoRepository
                .findByPacienteAndTipoTelefono(p, "personal")
                .map(Telefono::getNumeroTelefono)
                .orElse(null);

        ContactoEmergencia contacto = contactoEmergenciaRepository.findByPaciente(p)
                .stream().findFirst().orElse(null);

        Domicilio dom = p.getResidencia() != null ? p.getResidencia().getDomicilio() : null;
        String direccion    = dom != null ? dom.getCalle() : null;
        Localidad localidad = dom != null ? dom.getLocalidad() : null;
        Provincia provincia = localidad != null ? localidad.getProvincia() : null;

        AfiliacionObraSocial afl = p.getAfiliacion();
        ObraSocial os = afl != null ? afl.getObraSocial() : null;

        // Parsear antecedentes del texto libre (separados por " | ")
        String antecText = p.getFichaMedica().getAntecedentesText();
        String enfermedades = null;
        String antFamiliar = null;
        if (StringUtils.hasText(antecText)) {
            for (String part : antecText.split("\\|")) {
                String t = part.trim();
                if (t.startsWith("Enf. crónicas: "))
                    enfermedades = t.substring("Enf. crónicas: ".length());
                else if (t.startsWith("Antec. familiar: "))
                    antFamiliar = t.substring("Antec. familiar: ".length());
            }
        }

        return PacienteResponseDTO.builder()
                .id(p.getIdPaciente())
                .nombre(p.getPersona().getNombrePersona())
                .apellido(p.getPersona().getApellidoPersona())
                .nombreCompleto(p.getPersona().getNombrePersona() + " " + p.getPersona().getApellidoPersona())
                .dni(p.getDni())
                .edad(calcularEdad(fechaNacimiento))
                .fechaNacimiento(fechaNacimiento)
                .tipoSangre(p.getFichaMedica().getTipoSangre())
                .alergias(alergias)
                .enfermedadesCronicas(enfermedades)
                .antecedenteFamiliar(antFamiliar)
                .obraSocial(os != null ? os.getNombreObra() : null)
                .idObraSocial(os != null ? os.getIdObraSocial() : null)
                .nroAfiliado(afl != null ? afl.getNumeroAfiliado() : null)
                .estado("Ambulatorio")
                .telefono(telPersonal)
                .direccion(direccion)
                .idLocalidad(localidad != null ? localidad.getIdLocalidad() : null)
                .nombreLocalidad(localidad != null ? localidad.getNombreLocalidad() : null)
                .idProvincia(provincia != null ? provincia.getIdProvincia() : null)
                .nombreProvincia(provincia != null ? provincia.getNombreProvincia() : null)
                .contactoEmergenciaNombre(contacto != null ? contacto.getNombreCompleto() : null)
                .contactoEmergenciaTelefono(contacto != null ? contacto.getTelefonoCelular() : null)
                .contactoEmergenciaParentesco(contacto != null ? contacto.getParentesco() : null)
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
