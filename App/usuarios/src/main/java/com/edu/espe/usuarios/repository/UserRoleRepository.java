package com.edu.espe.usuarios.repository;

import com.edu.espe.usuarios.entity.UserRole;
import com.edu.espe.usuarios.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    boolean existsByUser_IdAndRole_Id(UUID userId, UUID roleId);
}