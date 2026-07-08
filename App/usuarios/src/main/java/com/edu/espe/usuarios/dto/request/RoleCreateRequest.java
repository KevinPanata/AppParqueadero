package com.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleCreateRequest {

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 25, message = "El nombre no puede superar los 25 caracteres")
    @Pattern(regexp = "^[A-Z_]+$", message = "El nombre del rol solo puede contener letras mayúsculas y guiones bajos (_)")
    private String name;

    @Size(max = 100, message = "La descripción no puede superar los 100 caracteres")
    @Pattern(regexp = "^$|^(?!.*\\s{2,})[^<>]*$", message = "La descripción no puede contener etiquetas HTML ni espacios múltiples")
    private String description;
}