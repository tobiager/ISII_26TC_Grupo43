package com.clinicks.repository;

import com.clinicks.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Paciente p WHERE p.idPaciente = :id AND p.deletedAt IS NULL")
    Optional<Paciente> encontrarPacienteActivoPorId(@org.springframework.data.repository.query.Param("id") Integer id);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Paciente p WHERE p.dni = :dni")
    boolean existePorDni(@org.springframework.data.repository.query.Param("dni") Integer dni);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Paciente p WHERE p.dni = :dni AND p.idPaciente != :idPaciente")
    boolean existePorDniYNoIdPaciente(@org.springframework.data.repository.query.Param("dni") Integer dni, @org.springframework.data.repository.query.Param("idPaciente") Integer idPaciente);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END 
        FROM Paciente p
        JOIN p.afiliacion a
        WHERE a.numeroAfiliado = :nroAfiliado
        AND a.obraSocial.idObraSocial = :idObraSocial
        AND p.deletedAt IS NULL
        AND (:excluirId IS NULL OR p.idPaciente != :excluirId)
    """)
    boolean existePorAfiliacionYObraSocialId(@Param("nroAfiliado") String nroAfiliado, 
                                              @Param("idObraSocial") Integer idObraSocial, 
                                              @Param("excluirId") Integer excluirId);

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END 
        FROM Paciente p
        JOIN p.afiliacion a
        WHERE a.numeroAfiliado = :nroAfiliado
        AND LOWER(a.obraSocial.nombreObra) = LOWER(:nombreObra)
        AND p.deletedAt IS NULL
        AND (:excluirId IS NULL OR p.idPaciente != :excluirId)
    """)
    boolean existePorAfiliacionYObraSocialNombre(@Param("nroAfiliado") String nroAfiliado, 
                                                  @Param("nombreObra") String nombreObra, 
                                                  @Param("excluirId") Integer excluirId);

    @Query(value = """
        SELECT
            p.id_paciente          AS idPaciente,
            per.nombre_persona     AS nombrePersona,
            per.apellido_persona   AS apellidoPersona,
            per.fecha_nacimiento   AS fechaNacimiento,
            p.dni,
            afl.numero_afiliado    AS nroAfiliado,
            fm.tipo_sangre         AS tipoSangre,
            STRING_AGG(DISTINCT al.nombre_alergia, ', ' ORDER BY al.nombre_alergia) AS alergias,
            os.nombre_obra         AS nombreObra,
            os.id_obra_social      AS idObraSocial,
            CASE
                WHEN i.id_internacion IS NOT NULL THEN 'Internado'
                WHEN hm.estado_historial = 'cerrado' THEN 'Egresado'
                ELSE 'Ambulatorio'
            END                    AS estado,
            hi.numero_habitacion   AS numeroHabitacion,
            hm.fecha_actualizacion AS ultimaVisita
        FROM paciente p
        JOIN persona per       ON p.id_persona      = per.id_persona
        JOIN ficha_medica fm   ON p.id_ficha_medica = fm.id_ficha_medica
        LEFT JOIN afiliacion_obra_social afl ON p.id_afiliacion    = afl.id_afiliacion
        LEFT JOIN obra_social os             ON afl.id_obra_social  = os.id_obra_social
        LEFT JOIN ficha_alergia fa           ON fm.id_ficha_medica  = fa.id_ficha_medica
        LEFT JOIN alergia al                 ON fa.id_alergia       = al.id_alergia
        LEFT JOIN (
            SELECT DISTINCT ON (id_paciente) *
            FROM historial_medico
            ORDER BY id_paciente, fecha_creacion DESC
        ) hm ON p.id_paciente = hm.id_paciente
        LEFT JOIN internacion i
            ON hm.id_historial = i.id_historial AND i.fecha_fin IS NULL
        LEFT JOIN habitacion_internacion hi
            ON i.id_habitacion_internacion = hi.id_habitacion_internacion
        WHERE p.deleted_at IS NULL
        GROUP BY p.id_paciente, per.nombre_persona, per.apellido_persona, per.fecha_nacimiento,
                 p.dni, afl.numero_afiliado, fm.tipo_sangre,
                 os.nombre_obra, os.id_obra_social,
                 estado, hi.numero_habitacion, hm.fecha_actualizacion
        ORDER BY per.apellido_persona, per.nombre_persona
        """, nativeQuery = true)
    List<PacienteResumenProjection> encontrarTodosLosPacientesActivosConDetalles();

    @Query(value = """
        SELECT
            p.id_paciente          AS idPaciente,
            per.nombre_persona     AS nombrePersona,
            per.apellido_persona   AS apellidoPersona,
            per.fecha_nacimiento   AS fechaNacimiento,
            p.dni,
            afl.numero_afiliado    AS nroAfiliado,
            fm.tipo_sangre         AS tipoSangre,
            STRING_AGG(DISTINCT al.nombre_alergia, ', ' ORDER BY al.nombre_alergia) AS alergias,
            os.nombre_obra         AS nombreObra,
            os.id_obra_social      AS idObraSocial,
            'Inactivo'             AS estado,
            NULL                   AS numeroHabitacion,
            NULL                   AS ultimaVisita
        FROM paciente p
        JOIN persona per       ON p.id_persona      = per.id_persona
        JOIN ficha_medica fm   ON p.id_ficha_medica = fm.id_ficha_medica
        LEFT JOIN afiliacion_obra_social afl ON p.id_afiliacion    = afl.id_afiliacion
        LEFT JOIN obra_social os             ON afl.id_obra_social  = os.id_obra_social
        LEFT JOIN ficha_alergia fa           ON fm.id_ficha_medica  = fa.id_ficha_medica
        LEFT JOIN alergia al                 ON fa.id_alergia       = al.id_alergia
        WHERE p.deleted_at IS NOT NULL
        GROUP BY p.id_paciente, per.nombre_persona, per.apellido_persona, per.fecha_nacimiento,
                 p.dni, afl.numero_afiliado, fm.tipo_sangre, os.nombre_obra, os.id_obra_social
        ORDER BY per.apellido_persona, per.nombre_persona
        """, nativeQuery = true)
    List<PacienteResumenProjection> encontrarTodosLosPacientesEliminadosConDetalles();

    @Query("""
        SELECT p FROM Paciente p
        WHERE p.deletedAt IS NULL
        AND (
            CAST(p.dni AS string) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.persona.apellidoPersona) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.persona.nombrePersona)   LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY p.persona.apellidoPersona, p.persona.nombrePersona
        """)
    List<Paciente> buscarPorDniONombre(@Param("query") String query);

    interface PacienteResumenProjection {
        Integer getIdPaciente();
        String getNombrePersona();
        String getApellidoPersona();
        java.sql.Timestamp getFechaNacimiento();
        Integer getDni();
        String getNroAfiliado();
        String getTipoSangre();
        String getAlergias();
        String getNombreObra();
        Integer getIdObraSocial();
        String getEstado();
        String getNumeroHabitacion();
        java.sql.Timestamp getUltimaVisita();
    }
}
