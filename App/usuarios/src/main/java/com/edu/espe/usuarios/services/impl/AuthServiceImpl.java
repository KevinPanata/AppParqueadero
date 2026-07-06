package com.edu.espe.usuarios.services.impl;

import com.edu.espe.usuarios.dto.request.LoginRequest;
import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.AuthResponse;
import com.edu.espe.usuarios.dto.response.UserResponse;
import com.edu.espe.usuarios.entity.User;
import com.edu.espe.usuarios.repository.UserRepository;
import com.edu.espe.usuarios.security.JwtService;
import com.edu.espe.usuarios.services.AuthService;
import com.edu.espe.usuarios.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public UserResponse register(UserCreateRequest request) {
        return userService.createUser(request);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByPersonEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        String token = jwtService.generateToken(user);

        UserResponse userResponse = userService.getUserById(user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}