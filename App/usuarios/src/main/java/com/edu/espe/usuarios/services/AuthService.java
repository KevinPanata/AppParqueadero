package com.edu.espe.usuarios.services;

import com.edu.espe.usuarios.dto.request.LoginRequest;
import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.AuthResponse;
import com.edu.espe.usuarios.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(UserCreateRequest request);

    AuthResponse login(LoginRequest request);
}