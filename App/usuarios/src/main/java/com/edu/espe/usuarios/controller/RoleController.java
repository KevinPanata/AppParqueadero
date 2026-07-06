package com.edu.espe.usuarios.controller;

import com.edu.espe.usuarios.dto.request.RoleCreateRequest;
import com.edu.espe.usuarios.dto.response.RoleResponse;
import com.edu.espe.usuarios.services.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public RoleResponse createRole(@Valid @RequestBody RoleCreateRequest request) {
        return roleService.createRole(request);
    }

    @GetMapping
    public List<RoleResponse> getRoles() {
        return roleService.getRoles();
    }

    @GetMapping("/{id}")
    public RoleResponse getRoleById(@PathVariable UUID id) {
        return roleService.getRoleById(id);
    }
}