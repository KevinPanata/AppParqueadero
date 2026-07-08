package ec.edu.espe.zonas.servicios.impl;

import ec.edu.espe.zonas.dto.AuditEvent;
import ec.edu.espe.zonas.dto.CambiarEstadoEspacioDTO;
import ec.edu.espe.zonas.dto.EspacioRequestDTO;
import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import ec.edu.espe.zonas.response.EspacioResponseDto;
import ec.edu.espe.zonas.servicios.interfaz.EspacioServicio;
import ec.edu.espe.zonas.servicios.impl.EventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class ServicioEspacio implements EspacioServicio {

    private final EspacioRepositorio espacioRepositorio;
    private final ZonaRepositorio zonaRepositorio;
    private final EventPublisher eventPublisher;

    // Método auxiliar para emitir eventos
    private void emitEvent(String accion, Espacio espacio, Map<String, Object> datosExtra, String usuario, String ip) {
        AuditEvent event = AuditEvent.builder()
                .servicio("ms-zonas-espacios")
                .accion(accion)
                .entidad("Espacio")
                .entidadId(espacio.getId().toString())
                .datos(Map.of(
                        "espacio", Map.of(
                                "id", espacio.getId(),
                                "nombre", espacio.getNombre(),
                                "estado", espacio.getEstado().name(),
                                "zona", espacio.getZona().getNombre()
                        ),
                        "extra", datosExtra != null ? datosExtra : Map.of()
                ))
                .usuario(usuario != null ? usuario : "sistema")
                .ip(ip != null ? ip : "0.0.0.0")
                .build();

        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDto> obtenerEspacios() {
        List<Espacio> espacios = espacioRepositorio.findByActivoTrue();

        // 📝 Evento de auditoría
        if (!espacios.isEmpty()) {
            AuditEvent event = AuditEvent.builder()
                    .servicio("ms-zonas-espacios")
                    .accion("READ_ALL")
                    .entidad("Espacio")
                    .datos(Map.of("cantidad", espacios.size()))
                    .usuario("sistema")
                    .ip("0.0.0.0")
                    .build();
            eventPublisher.publishEvent(event);
        }

        return espacios.stream()
                .map(this::mapearResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EspacioResponseDto obtenerEspacio(UUID id) {
        Espacio espacio = buscarEspacioPorId(id);

        // Evento de auditoría
        emitEvent("READ", espacio, null, null, null);

        return mapearResponse(espacio);
    }

    @Override
    @Transactional
    public EspacioResponseDto crearEspacio(EspacioRequestDTO requestDto) {
        Zona zona = buscarZonaPorId(requestDto.getIdZona());

        validarZonaActiva(zona);
        validarCapacidadDisponible(zona);

        Espacio espacio = Espacio.builder()
                .nombre(generarNombreEspacio(zona))
                .descripcion(requestDto.getDescripcion())
                .tipo(requestDto.getTipo())
                .estado(EstadoEspacio.DISPONIBLE)
                .activo(true)
                .zona(zona)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        Espacio guardado = espacioRepositorio.save(espacio);

        // Evento de auditoría
        emitEvent("CREATE", guardado, Map.of("zona", zona.getNombre()), null, null);

        return mapearResponse(guardado);
    }

    @Override
    @Transactional
    public EspacioResponseDto actualizarEspacio(UUID id, EspacioRequestDTO requestDto) {
        Espacio espacio = buscarEspacioPorId(id);

        if (!espacio.isActivo()) {
            throw new IllegalStateException("No se puede actualizar un espacio inactivo.");
        }

        if (requestDto.getIdZona() == null) {
            throw new IllegalArgumentException("El ID de la zona es obligatorio.");
        }

        Zona nuevaZona = buscarZonaPorId(requestDto.getIdZona());
        validarZonaActiva(nuevaZona);

        // Guardar estado anterior
        Map<String, Object> estadoAnterior = Map.of(
                "nombre", espacio.getNombre(),
                "descripcion", espacio.getDescripcion(),
                "tipo", espacio.getTipo(),
                "zona", espacio.getZona().getNombre(),
                "estado", espacio.getEstado().name()
        );

        boolean cambioDeZona = !nuevaZona.getId().equals(espacio.getZona().getId());

        if (cambioDeZona) {
            if (espacio.getEstado() == EstadoEspacio.OCUPADO) {
                throw new IllegalStateException("No se puede mover un espacio ocupado a otra zona.");
            }

            validarCapacidadDisponible(nuevaZona);
            espacio.setZona(nuevaZona);
            espacio.setNombre(generarNombreEspacio(nuevaZona));
        }

        espacio.setDescripcion(requestDto.getDescripcion());
        espacio.setTipo(requestDto.getTipo());
        espacio.setFechaActualizacion(LocalDateTime.now());

        Espacio actualizado = espacioRepositorio.save(espacio);

        // Evento de auditoría
        emitEvent("UPDATE", actualizado, Map.of(
                "cambios", Map.of(
                        "descripcion", requestDto.getDescripcion(),
                        "tipo", requestDto.getTipo(),
                        "nuevaZona", nuevaZona.getNombre()
                ),
                "estadoAnterior", estadoAnterior
        ), null, null);

        return mapearResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminarEspacio(UUID id) {
        Espacio espacio = buscarEspacioPorId(id);

        if (espacio.getEstado() == EstadoEspacio.OCUPADO) {
            throw new IllegalStateException("No se puede eliminar un espacio ocupado.");
        }

        // Evento de auditoría antes de eliminar
        emitEvent("DELETE", espacio, Map.of(
                "estado", "eliminado",
                "zona", espacio.getZona().getNombre()
        ), null, null);

        espacio.setActivo(false);
        espacio.setFechaActualizacion(LocalDateTime.now());
        espacioRepositorio.save(espacio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDto> espaciosPorEstado(EstadoEspacio estado) {
        return espacioRepositorio.findByEstado(estado)
                .stream()
                .map(this::mapearResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspacioResponseDto> obtenerEspaciosPorZonaYEstado(UUID idZona, EstadoEspacio estado) {
        Zona zona = buscarZonaPorId(idZona);
        return espacioRepositorio.findByZonaAndEstado(zona, estado)
                .stream()
                .map(this::mapearResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> obtenerEspaciosPorEstadoAgrupadosPorZona(EstadoEspacio estado) {
        List<Object[]> resultados = espacioRepositorio.findEspaciosPorEstadoAgrupadosPorZona(estado);
        Map<String, Long> mapa = new LinkedHashMap<>();

        for (Object[] fila : resultados) {
            Zona zona = (Zona) fila[0];
            Long cantidad = (Long) fila[1];
            mapa.put(zona.getNombre(), cantidad);
        }

        return mapa;
    }

    @Override
    @Transactional
    public EspacioResponseDto cambiarEstado(UUID id, CambiarEstadoEspacioDTO dto) {
        Espacio espacio = buscarEspacioPorId(id);

        if (!espacio.isActivo()) {
            throw new IllegalStateException("No se puede cambiar el estado de un espacio inactivo.");
        }

        EstadoEspacio estadoActual = espacio.getEstado();
        EstadoEspacio nuevoEstado = dto.getNuevoEstado();

        if (estadoActual == nuevoEstado) {
            throw new IllegalStateException("El espacio ya se encuentra en estado " + nuevoEstado + ".");
        }

        validarCambioEstado(estadoActual, nuevoEstado);

        espacio.setEstado(nuevoEstado);
        espacio.setFechaActualizacion(LocalDateTime.now());

        Espacio actualizado = espacioRepositorio.save(espacio);

        // Evento de auditoría
        emitEvent("CHANGE_STATE", actualizado, Map.of(
                "estadoAnterior", estadoActual.name(),
                "nuevoEstado", nuevoEstado.name()
        ), null, null);

        return mapearResponse(actualizado);
    }

    private void validarCambioEstado(EstadoEspacio actual, EstadoEspacio nuevo) {
        if (actual == EstadoEspacio.MANTENIMIENTO && nuevo == EstadoEspacio.OCUPADO) {
            throw new IllegalStateException("No se puede cambiar directamente de MANTENIMIENTO a OCUPADO.");
        }

        if (actual == EstadoEspacio.OCUPADO && nuevo == EstadoEspacio.MANTENIMIENTO) {
            throw new IllegalStateException("Primero debe liberar el espacio antes de enviarlo a mantenimiento.");
        }
    }

    private void validarCapacidadDisponible(Zona zona) {
        long espaciosActivos = espacioRepositorio.countByZonaAndActivoTrue(zona);

        if (espaciosActivos >= zona.getCapacidad()) {
            throw new IllegalStateException(
                    "La zona " + zona.getNombre() + " ya alcanzó su capacidad máxima de " + zona.getCapacidad() + " espacios."
            );
        }
    }

    private void validarZonaActiva(Zona zona) {
        if (!zona.isActivo()) {
            throw new IllegalStateException("No se puede usar una zona inactiva.");
        }
    }

    private Zona buscarZonaPorId(UUID idZona) {
        return zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new IllegalArgumentException("No existe una zona con el ID: " + idZona));
    }

    private Espacio buscarEspacioPorId(UUID id) {
        return espacioRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe un espacio con el ID: " + id));
    }

    private String generarNombreEspacio(Zona zona) {
        int secuencia = 1;
        String nombreGenerado;

        do {
            nombreGenerado = zona.getCodigo() + "-" + String.format("%03d", secuencia);
            secuencia++;
        } while (espacioRepositorio.existsByNombre(nombreGenerado));

        return nombreGenerado;
    }

    private EspacioResponseDto mapearResponse(Espacio espacio) {
        return EspacioResponseDto.builder()
                .id(espacio.getId())
                .nombre(espacio.getNombre())
                .descripcion(espacio.getDescripcion())
                .tipo(espacio.getTipo())
                .estado(espacio.getEstado())
                .activo(espacio.isActivo())
                .idZona(espacio.getZona().getId())
                .nombreZona(espacio.getZona().getNombre())
                .fechaCreacion(espacio.getFechaCreacion())
                .fechaActualizacion(espacio.getFechaActualizacion())
                .build();
    }
}