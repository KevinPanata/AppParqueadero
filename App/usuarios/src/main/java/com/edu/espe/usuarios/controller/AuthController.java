package com.edu.espe.usuarios.controller;

import com.edu.espe.usuarios.dto.request.LoginRequest;
import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.AuthResponse;
import com.edu.espe.usuarios.dto.response.UserResponse;
import com.edu.espe.usuarios.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody UserCreateRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}