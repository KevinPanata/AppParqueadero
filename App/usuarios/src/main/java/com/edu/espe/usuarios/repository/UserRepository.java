package com.edu.espe.usuarios.repository;

import com.edu.espe.usuarios.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByUsername(String username);

    Optional<User> findByPersonDni(String dni);

    Optional<User> findByPersonEmail(String email);
}