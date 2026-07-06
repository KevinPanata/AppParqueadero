package com.edu.espe.usuarios.repository;

import com.edu.espe.usuarios.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PersonRepository extends JpaRepository<Person, UUID> {

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}