package ec.edu.espe.zonas.services.interfaz;

import ec.edu.espe.zonas.dto.request.ZonaRequestDTO;
import ec.edu.espe.zonas.dto.response.ZonaResponseDto;
import ec.edu.espe.zonas.models.enums.EstadoZona;

import java.util.List;
import java.util.UUID;

public interface ZonaService {

    List<ZonaResponseDto> listarZonas();

    ZonaResponseDto crearZona(ZonaRequestDTO requestDto);

    ZonaResponseDto actualizarZona(UUID idZona, ZonaRequestDTO requestDto);

    void eliminarZona(UUID idZona);

    ZonaResponseDto cambiarEstado(UUID idZona, EstadoZona nuevoEstado);
}