package com.edu.espe.usuarios.services;

import com.edu.espe.usuarios.dto.request.RoleCreateRequest;
import com.edu.espe.usuarios.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    RoleResponse createRole(RoleCreateRequest request);

    List<RoleResponse> getRoles();

    RoleResponse getRoleById(UUID id);
}