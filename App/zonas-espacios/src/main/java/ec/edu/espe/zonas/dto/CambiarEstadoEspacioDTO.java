package ec.edu.espe.zonas.dto;

import ec.edu.espe.zonas.entidades.EstadoEspacio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CambiarEstadoEspacioDTO {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoEspacio nuevoEstado;
}