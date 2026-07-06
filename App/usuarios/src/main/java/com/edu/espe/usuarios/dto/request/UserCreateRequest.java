package com.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank(message = "DNI is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "DNI debe tener exactamente 10 dígitos numéricos")
    private String dni;

    @NotBlank(message = "Nombre is required")
    @Size(max = 25)
    @Pattern(regexp = "^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$", message = "Solo puede tener letras")
    private String firstName;

    @Size(max = 25)
    @Pattern(regexp = "^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]*$", message = "Solo puede tener letras")
    private String middleName;

    @NotBlank(message = "Apellido is required")
    @Size(max = 25)
    @Pattern(regexp = "^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$", message = "Solo puede tener letras")
    private String lastName;

    @NotBlank(message = "Correo is required")
    @Size(max = 40)
    @Email(message = "Correo inválido")
    private String email;

    @NotBlank(message = "Teléfono is required")
    @Pattern(regexp = "^09[0-9]{8}$", message = "El celular debe iniciar con 09 y tener 10 dígitos")
    private String phone;

    private String address;

    @NotBlank(message = "Nacionalidad is required")
    @Size(max = 25)
    private String nationality;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50)
    private String password;
}