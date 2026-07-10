package ec.edu.espe.usuarios.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleCreateRequest {

    @NotBlank(message = "Role name is required")
    @Size(min = 3, max = 25, message = "Role name must be between 3 and 25 characters")
    private String name;

    @Size(max = 255, message = "Description is too long (max 255 characters)")
    private String description;

    @Builder.Default
    private Boolean active = true;
}