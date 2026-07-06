package ec.edu.espe.zonas.servicios.impl;

import ec.edu.espe.zonas.dto.ZonaRequestDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.EstadoZona;
import ec.edu.espe.zonas.entidades.Zona;
import ec.edu.espe.zonas.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.repositorios.ZonaRepositorio;
import ec.edu.espe.zonas.response.ZonaResponseDto;
import ec.edu.espe.zonas.servicios.interfaz.ZonaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ServicioZona implements ZonaServicio {
    private final ZonaRepositorio zonaRepositorio;
    private final EspacioRepositorio espacioRepositorio;

    @Override
    @Transactional(readOnly = true)
    public List<ZonaResponseDto> listarZonas() {
        return zonaRepositorio.findByActivoTrue()
                .stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ZonaResponseDto crear(ZonaRequestDTO requestDto) {
        if (zonaRepositorio.existsByNombre(requestDto.getNombre())) {
            throw new RuntimeException("Ya existe una zona con el nombre: " + requestDto.getNombre());
        }

        // Generar código automático: ZON-[TIPO]-[número secuencial 2 dígitos]
        // Ejemplo: ZON-VIP-01
        int totalZonas = (int) zonaRepositorio.count();
        String codigoGenerado = generarCodigoZona(requestDto.getTipo().name());
        Zona zona = Zona.builder()
                .nombre(requestDto.getNombre())
                .codigo(codigoGenerado)
                .descripcion(requestDto.getDescripcion())
                .capacidad(requestDto.getCapacidad())
                .tipo(requestDto.getTipo())
                .estado(EstadoZona.ACTIVA)
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        Zona guardada = zonaRepositorio.save(zona);
        return mapearAResponse(guardada);
    }

    @Override
    @Transactional
    public ZonaResponseDto actualizar(UUID id, ZonaRequestDTO requestDto) {
        Zona zona = zonaRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Zona no encontrada con id: " + id));

        String nombre = requestDto.getNombre().trim().toUpperCase();

        if (zonaRepositorio.existsByNombreAndIdNot(nombre, id)) {
            throw new IllegalArgumentException("Ya existe otra zona con el nombre: " + nombre);
        }

        long espaciosActivos = espacioRepositorio.countByZonaAndActivoTrue(zona);

        if (requestDto.getCapacidad() < espaciosActivos) {
            throw new IllegalStateException(
                    "La capacidad no puede ser menor al número de espacios activos existentes: " + espaciosActivos
            );
        }

        zona.setNombre(nombre);
        zona.setDescripcion(requestDto.getDescripcion());
        zona.setCapacidad(requestDto.getCapacidad());
        zona.setTipo(requestDto.getTipo());
        zona.setFechaActualizacion(LocalDateTime.now());

        Zona actualizada = zonaRepositorio.save(zona);
        return mapearAResponse(actualizada);
    }

    @Override
    @Transactional
    public void eliminarZona(UUID idZona) {
        Zona zona = zonaRepositorio.findById(idZona)
                .orElseThrow(() -> new IllegalArgumentException("No existe una zona con el ID: " + idZona));

        boolean tieneEspaciosOcupados = espacioRepositorio.existsByZonaAndEstado(zona, EstadoEspacio.OCUPADO);

        if (tieneEspaciosOcupados) {
            throw new IllegalStateException("No se puede eliminar la zona porque tiene espacios ocupados.");
        }

        zona.setActivo(false);
        zona.setFechaActualizacion(LocalDateTime.now());
        zonaRepositorio.save(zona);
    }

    // ---- Métodos auxiliares privados ----

    /**
     * Genera el código de zona con el formato:
     * ZON-[TIPO]-[número secuencial de 2 dígitos]
     * Ejemplo: ZON-VIP-01
     */
    private String generarCodigoZona(String tipoZona) {
        String tipoAbreviado = tipoZona.substring(0, 3).toUpperCase();
        int secuencia = 1;
        String codigo;

        do {
            codigo = "ZON-" + tipoAbreviado + "-" + String.format("%02d", secuencia);
            secuencia++;
        } while (zonaRepositorio.existsByCodigo(codigo));

        return codigo;
    }

    /**
     * Convierte una entidad Zona a su DTO de respuesta.
     * Calcula el total de espacios disponibles contando los que tienen
     * estado DISPONIBLE en la lista de espacios de la zona.
     */
    private ZonaResponseDto mapearAResponse(Zona zona) {
        long disponibles = espacioRepositorio.countByZonaAndEstado(zona, EstadoEspacio.DISPONIBLE);

        return ZonaResponseDto.builder()
                .id(zona.getId())
                .nombre(zona.getNombre())
                .codigo(zona.getCodigo())
                .descripcion(zona.getDescripcion())
                .capacidad(zona.getCapacidad())
                .tipo(zona.getTipo())
                .activo(zona.isActivo())
                .fechaCreacion(zona.getFechaCreacion())
                .fechaActualizacion(zona.getFechaActualizacion())
                .espaciosDisponibles((int) disponibles)
                .build();
    }
}

