package com.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{10}$", message = "El DNI debe tener exactamente 10 dígitos numéricos")
    private String dni;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 25, message = "El nombre no puede exceder los 25 caracteres")
    // Este regex exige: Iniciar con mayúscula, seguir con minúsculas, permite un
    // espacio entre nombres, no permite tags, ni números, ni espacios múltiples.
    @Pattern(regexp = "^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$", message = "El nombre debe contener solo letras, iniciar con mayúscula y no tener espacios múltiples")
    private String firstName;

    @Size(max = 25, message = "El segundo nombre no puede exceder los 25 caracteres")
    // Igual al anterior, pero con ^$| al inicio para permitir que el campo venga
    // vacío sin dar error.
    @Pattern(regexp = "^$|^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$", message = "El segundo nombre debe contener solo letras, iniciar con mayúscula y no tener espacios múltiples")
    private String middleName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 25, message = "El apellido no puede exceder los 25 caracteres")
    @Pattern(regexp = "^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+( [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$", message = "El apellido debe contener solo letras, iniciar con mayúscula y no tener espacios múltiples")
    private String lastName;

    @NotBlank(message = "El correo es obligatorio")
    @Size(max = 40, message = "El correo no puede exceder los 40 caracteres")
    @Email(message = "Correo inválido")
    @Pattern(regexp = "^[^<>]*$", message = "El correo no puede contener etiquetas HTML (< o >)")
    @Pattern(regexp = "^(?!.*\\s).*", message = "El correo no debe contener espacios en blanco")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^09[0-9]{8}$", message = "El celular debe iniciar con 09, tener exactamente 10 dígitos y no contener letras ni espacios")
    private String phone;

    @Size(max = 100, message = "La dirección no puede exceder los 100 caracteres")
    // (?!.*\\s{2,}) rechaza la petición si encuentra 2 o más espacios seguidos.
    // [^<>]* evita las etiquetas HTML.
    @Pattern(regexp = "^(?!.*\\s{2,})[^<>]*$", message = "La dirección no puede contener etiquetas HTML ni espacios múltiples")
    private String address;

    @NotBlank(message = "La nacionalidad es obligatoria")
    @Size(max = 25, message = "La nacionalidad no puede exceder los 25 caracteres")
    @Pattern(regexp = "^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$", message = "La nacionalidad solo puede tener letras")
    @Pattern(regexp = "^(?!.*\\s{2,})[^<>]*$", message = "La nacionalidad no puede tener espacios múltiples")
    private String nationality;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 20, message = "La contraseña debe tener entre 8 y 20 caracteres")
    // Se ajustó el final del regex a .{8,20} para respetar el nuevo límite
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*_.\\-]).{8,20}$", message = "La contraseña debe tener al menos: una mayúscula, una minúscula, un número, un carácter especial y máximo 20 caracteres")
    @Pattern(regexp = "^[^<>]*$", message = "La contraseña no puede contener etiquetas HTML (< o >)")
    @Pattern(regexp = "^\\S*$", message = "La contraseña no puede contener espacios en blanco")
    private String password;
}