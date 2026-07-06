package ec.edu.espe.zonas.response;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoZona;
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
    private boolean activo;
    private EstadoEspacio estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    // Total de espacios con estado DISPONIBLE en esta zona
    private int espaciosDisponibles;

}

