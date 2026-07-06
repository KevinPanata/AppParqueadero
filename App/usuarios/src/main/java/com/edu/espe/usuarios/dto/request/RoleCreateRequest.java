package com.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleCreateRequest {

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 25)
    private String name;

    private String description;
}