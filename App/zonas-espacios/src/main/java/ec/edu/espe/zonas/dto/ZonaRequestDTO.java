package ec.edu.espe.zonas.dto;

import ec.edu.espe.zonas.entidades.TipoZona;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ZonaRequestDTO {
    @NotBlank(message = "El nombre de la zona no puede estar vacío")
    @Size(max = 10, message = "El nombre de la zona no puede tener más de 10 caracteres")
    @Pattern(regexp = "^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9 ]+$", message = "El nombre solo puede contener letras, números y espacios")
    private String nombre;

    private String descripcion;

    @Min(value = 1, message = "La capacidad debe ser un número positivo")
    @Max(value = 100, message = "La capacidad no puede ser mayor a 100")
    private int capacidad;

    @NotNull(message = "El tipo de zona no puede ser nulo")
    private TipoZona tipo;

}

