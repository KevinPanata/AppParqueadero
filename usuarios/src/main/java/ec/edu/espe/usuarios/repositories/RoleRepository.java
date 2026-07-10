package ec.edu.espe.usuarios.repositories;

import ec.edu.espe.usuarios.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Boolean existsByName(String name);

}