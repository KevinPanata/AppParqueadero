package ec.edu.espe.zonas.dto.response;

import ec.edu.espe.zonas.models.enums.EstadoZona;
import ec.edu.espe.zonas.models.enums.TipoZona;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZonaResponseDto {
    private UUID id;
    private String nombre;
    private String codigo;
    private String descripcion;
    private int capacidad;
    private TipoZona tipo;
    private EstadoZona estado; 
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private int espaciosDisponibles;
}