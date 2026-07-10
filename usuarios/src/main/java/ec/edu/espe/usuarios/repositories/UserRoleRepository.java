package ec.edu.espe.usuarios.repositories;

import ec.edu.espe.usuarios.models.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    boolean existsByUserIdAndRoleId(UUID userId, UUID roleId);
}
