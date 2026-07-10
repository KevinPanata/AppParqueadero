package ec.edu.espe.zonas.dto.request;

import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.models.enums.TipoEspacio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class EspacioRequestDTO {
    private String descripcion;

    @NotNull(message = "El tipo de espacio es obligatorio")
    private TipoEspacio tipo;

    @NotNull(message = "El identificador de la zona es obligatorio")
    private UUID idZona;

}

