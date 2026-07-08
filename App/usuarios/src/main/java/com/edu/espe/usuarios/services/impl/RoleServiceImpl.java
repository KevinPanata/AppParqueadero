package com.edu.espe.usuarios.services.impl;

import com.edu.espe.usuarios.dto.request.RoleCreateRequest;
import com.edu.espe.usuarios.dto.response.RoleResponse;
import com.edu.espe.usuarios.entity.Role;
import com.edu.espe.usuarios.repository.RoleRepository;
import com.edu.espe.usuarios.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.edu.espe.usuarios.messaging.AuditProducerService;
import java.util.Map;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final AuditProducerService auditProducer;


    @Override
    public RoleResponse createRole(RoleCreateRequest request) {

        String roleName = request.getName().trim().toUpperCase();

        if (roleRepository.existsByName(roleName)) {
            throw new IllegalArgumentException("El rol ya existe");
        }

        Role role = Role.builder()
                .name(roleName)
                .description(request.getDescription())
                .active(true)
                .build();

        role = roleRepository.save(role);

        // 🔴 DISPARAR AUDITORÍA
        auditProducer.enviarEventoAuditoria(
                "CREATE", 
                "ROL", 
                Map.of("nombre", role.getName(), "descripcion", role.getDescription() != null ? role.getDescription() : ""), 
                null // No tenemos UUID del usuario creador en este contexto
        );

        return mapToResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        return mapToResponse(role);
    }

    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .active(role.getActive())
                .createdAt(role.getCreatedAt())
                .build();
    }
}