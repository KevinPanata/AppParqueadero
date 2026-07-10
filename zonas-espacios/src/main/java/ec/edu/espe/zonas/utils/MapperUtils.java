package ec.edu.espe.zonas.utils;

import ec.edu.espe.zonas.dto.request.ZonaRequestDTO;
import ec.edu.espe.zonas.dto.request.EspacioRequestDTO;
import ec.edu.espe.zonas.dto.response.ZonaResponseDto;
import ec.edu.espe.zonas.dto.response.EspacioResponseDto;
import ec.edu.espe.zonas.models.Zona;
import ec.edu.espe.zonas.models.Espacio;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MapperUtils {

    // ==========================================
    // MAPEOS PARA ZONA
    // ==========================================

    public ZonaResponseDto toZonaResponseDto(Zona zona) {
    int espaciosDisponibles = (zona.getEspacios() == null) ? 0 : 
            (int) zona.getEspacios().stream()
                .filter(e -> e.getEstado() == ec.edu.espe.zonas.models.enums.EstadoEspacio.DISPONIBLE)
                .count();

    return ZonaResponseDto.builder()
            .id(zona.getId())
            .nombre(zona.getNombre())
            .codigo(zona.getCodigo())
            .descripcion(zona.getDescripcion())
            .capacidad(zona.getCapacidad())
            .tipo(zona.getTipo())
            .estado(zona.getEstado()) // <--- MAEPEAMOS EL NUEVO ENUM AQUÍ
            .fechaCreacion(zona.getFechaCreacion())
            .fechaActualizacion(zona.getFechaActualizacion())
            .espaciosDisponibles(espaciosDisponibles)
            .build();
}

    public Zona toZonaEntity(ZonaRequestDTO dto) {
    return Zona.builder()
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .capacidad(dto.getCapacidad())
            .tipo(dto.getTipo())
            // Quitamos el .activo() y dejamos que Lombok use el valor por defecto que le pusimos (@Builder.Default)
            .fechaCreacion(java.time.LocalDateTime.now())
            .fechaActualizacion(java.time.LocalDateTime.now()) // Buena práctica iniciar la fecha de actualización también
            .build();
}

    // ==========================================
    // MAPEOS PARA ESPACIO
    // ==========================================

    public EspacioResponseDto toEspacioResponseDto(Espacio espacio) {
        if (espacio == null) {
            return null;
        }

        return EspacioResponseDto.builder()
                .id(espacio.getId())
                .nombre(espacio.getNombre())
                .descripcion(espacio.getDescripcion())
                .tipo(espacio.getTipo())
                .estado(espacio.getEstado())
                .nombreZona(espacio.getZona() != null ? espacio.getZona().getNombre() : null)
                .idZona(espacio.getZona() != null ? espacio.getZona().getId() : null)
                .fechaCreacion(espacio.getFechaCreacion())
                .fechaActualizacion(espacio.getFechaActualizacion())
                .build();
    }

    public Espacio toEspacioEntity(EspacioRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        java.time.LocalDateTime ahora = java.time.LocalDateTime.now();

        return Espacio.builder()
                .descripcion(dto.getDescripcion())
                .tipo(dto.getTipo())
                .estado(ec.edu.espe.zonas.models.enums.EstadoEspacio.DISPONIBLE)
                .fechaCreacion(ahora)
                .fechaActualizacion(ahora)
                .build();
    }
}