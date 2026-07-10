package ec.edu.espe.zonas.services.interfaz;

import ec.edu.espe.zonas.dto.request.EspacioRequestDTO;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.dto.response.EspacioResponseDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface EspacioService {
    List<EspacioResponseDto> obtenerEspacios();

    EspacioResponseDto crearEspacio(EspacioRequestDTO requestDto);

    EspacioResponseDto actualizarEspacio(UUID id, EspacioRequestDTO requestDto);

    void eliminarEspacio(UUID id);

    EspacioResponseDto obtenerEspacio(UUID id);

    EspacioResponseDto cambiarEstado(UUID id, EstadoEspacio estado);

    List<EspacioResponseDto> obtenerEspaciosPorEstado(EstadoEspacio estado);

    List<EspacioResponseDto> obtenerEspaciosPorZonaEstado(UUID idZona, EstadoEspacio estado);
}