package ec.edu.espe.zonas.servicios.interfaz;

import ec.edu.espe.zonas.dto.CambiarEstadoEspacioDTO;
import ec.edu.espe.zonas.dto.EspacioRequestDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.response.EspacioResponseDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface EspacioServicio {

    List<EspacioResponseDto> obtenerEspacios();

    EspacioResponseDto obtenerEspacio(UUID id);

    EspacioResponseDto crearEspacio(EspacioRequestDTO requestDto);

    EspacioResponseDto actualizarEspacio(UUID id, EspacioRequestDTO requestDto);

    void eliminarEspacio(UUID id);

    List<EspacioResponseDto> espaciosPorEstado(EstadoEspacio estado);

    List<EspacioResponseDto> obtenerEspaciosPorZonaYEstado(UUID idZona, EstadoEspacio estado);

    Map<String, Long> obtenerEspaciosPorEstadoAgrupadosPorZona(EstadoEspacio estado);

    EspacioResponseDto cambiarEstado(UUID id, CambiarEstadoEspacioDTO dto);
}