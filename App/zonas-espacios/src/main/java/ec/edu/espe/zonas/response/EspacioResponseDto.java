package ec.edu.espe.zonas.response;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.TipoEspacio;
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
public class EspacioResponseDto {

    private UUID id;
    private String nombre;
    private String descripcion;
    private TipoEspacio tipo;
    private EstadoEspacio estado;
    private boolean activo;
    private String nombreZona;
    private UUID idZona;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}

