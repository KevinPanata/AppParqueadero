package ec.edu.espe.zonas.servicios.interfaz;

import ec.edu.espe.zonas.dto.ZonaRequestDTO;
import ec.edu.espe.zonas.response.ZonaResponseDto;

import java.util.List;
import java.util.UUID;

public interface ZonaServicio {
    List<ZonaResponseDto> listarZonas();

    ZonaResponseDto crear(ZonaRequestDTO requestDto);
    ZonaResponseDto actualizar(UUID id, ZonaRequestDTO requestDto);
    void eliminarZona(UUID id);



}
