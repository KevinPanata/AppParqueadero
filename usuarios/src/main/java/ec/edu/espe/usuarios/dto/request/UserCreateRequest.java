package ec.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank(message = "DNI is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "DNI must be exactly 10 digits")
    private String dni;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must be at most 50 characters")
    private String firstName;

    @NotBlank(message = "Second name is required")
    @Size(max = 50, message = "First name must be at most 50 characters")
    private String secondName;

    @NotBlank
    @Size(max = 50, message = "Middle name must be at most 50 characters")
    private String middleName; // Opcional, por lo que no lleva @NotBlank

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be at most 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is not valid")
    @Size(max = 100, message = "Email is too long")
    private String email;

    // Opcional, pero si lo envían, validamos que parezca un celular (empieza con 09 y tiene 10 dígitos en total)
    @Pattern(regexp = "^(09)[0-9]{8}$", message = "Phone must be a valid 10-digit mobile number")
    private String phone;

    @Size(max = 255, message = "Address is too long")
    private String address;

    @Size(max = 50, message = "Nationality must be at most 50 characters")
    private String nationality;
}