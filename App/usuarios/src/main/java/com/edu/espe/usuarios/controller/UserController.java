package com.edu.espe.usuarios.controller;

import com.edu.espe.usuarios.dto.request.UserCreateRequest;
import com.edu.espe.usuarios.dto.response.UserResponse;
import com.edu.espe.usuarios.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @PostMapping("/{userId}/roles/{roleId}")
    public UserResponse assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId
    ) {
        return userService.assignRole(userId, roleId);
    }

    @GetMapping("/dni/{dni}")
    public UserResponse getUserByDni(@PathVariable String dni) {
        return userService.getUserByDni(dni);
    }
}