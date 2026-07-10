package ec.edu.espe.usuarios.dto.response;

import ec.edu.espe.usuarios.models.Person;
import ec.edu.espe.usuarios.models.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserResponse {

    private UUID id;

    private String username;

    private boolean active;

    private PersonResponse person;

    private List<String> roles;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt;

}
