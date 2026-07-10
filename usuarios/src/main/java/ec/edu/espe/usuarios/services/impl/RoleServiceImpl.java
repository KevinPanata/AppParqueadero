package ec.edu.espe.usuarios.services.impl;

import ec.edu.espe.usuarios.dto.request.RoleCreateRequest;
import ec.edu.espe.usuarios.dto.response.RoleResponse;
import ec.edu.espe.usuarios.models.Role;
import ec.edu.espe.usuarios.repositories.RoleRepository;
import ec.edu.espe.usuarios.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public RoleResponse createRole(RoleCreateRequest roleRequest) {
        // Validar si el nombre del rol ya existe
        if (roleRepository.existsByName(roleRequest.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre del rol ya existe");
        }

        Role role = Role.builder()
                .name(roleRequest.getName())
                .description(roleRequest.getDescription())
                .active(roleRequest.getActive() != null ? roleRequest.getActive() : true)
                .build();

        role = roleRepository.save(role);
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(UUID id, RoleCreateRequest roleRequest) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

        // Validar si el nuevo nombre ya pertenece a otro rol
        if (!role.getName().equals(roleRequest.getName()) && roleRepository.existsByName(roleRequest.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nuevo nombre del rol ya está en uso");
        }

        role.setName(roleRequest.getName());
        role.setDescription(roleRequest.getDescription());
        if (roleRequest.getActive() != null) {
            role.setActive(roleRequest.getActive());
        }

        role = roleRepository.save(role);
        return mapToRoleResponse(role);
    }

    @Override
    @Transactional
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

        // Eliminación lógica
        role.setActive(false);
        roleRepository.save(role);
    }

    // Metodo de mapeo interno similar a tu UserServiceImpl
    private RoleResponse mapToRoleResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .active(role.getActive())
                .createdAt(role.getCreatedAt())
                .lastModified(role.getLastModified())
                .build();
    }
}