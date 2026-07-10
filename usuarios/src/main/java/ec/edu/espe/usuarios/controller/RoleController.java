package ec.edu.espe.usuarios.controller;

import ec.edu.espe.usuarios.dto.request.RoleCreateRequest;
import ec.edu.espe.usuarios.dto.response.RoleResponse;
import ec.edu.espe.usuarios.services.RoleService;
import ec.edu.espe.usuarios.services.AuditPublisher;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private AuditPublisher auditPublisher;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable UUID id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleCreateRequest roleRequest, Principal principal) {
        RoleResponse roleResponse = roleService.createRole(roleRequest);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("CREATE", "ROL", Map.of("name", roleRequest.getName()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(roleResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleCreateRequest roleRequest,
            Principal principal) {
        RoleResponse roleResponse = roleService.updateRole(id, roleRequest);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "ROL", Map.of("id", id.toString(), "name", roleRequest.getName()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(roleResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id, Principal principal) {
        roleService.deleteRole(id);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("DELETE", "ROL", Map.of("id", id.toString()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }
}