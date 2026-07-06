package com.edu.espe.usuarios.services;

import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse createUser(UserCreateRequest userCreateRequest);

    List<UserResponse> getUsers();

    UserResponse getUserById(UUID id);

    UserResponse assignRole(UUID userId, UUID roleId);

    UserResponse getUserByDni(String dni);
}