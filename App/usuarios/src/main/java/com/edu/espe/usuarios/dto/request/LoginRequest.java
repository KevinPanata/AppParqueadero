package com.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El email es obligatorio")
    @Pattern(regexp = "^[^<>]*$", message = "Caracteres no permitidos en el email")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}