package ec.edu.espe.usuarios.repositories;

import ec.edu.espe.usuarios.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, UUID> {

    Boolean existsByUsername(String username);
    List<User> findByUsername(String username);
    Optional<User> findUserByUsername(String username);
    long countByUsernameStartingWith(String prefix);


}