package ec.edu.espe.usuarios.controller;

import ec.edu.espe.usuarios.dto.request.UserCreateRequest;
import ec.edu.espe.usuarios.dto.response.UserResponse;
import ec.edu.espe.usuarios.services.UserService;
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
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuditPublisher auditPublisher;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request, Principal principal) {
        UserResponse userResponse = userService.createUser(request);
        String actor = principal != null ? principal.getName() : userResponse.getUsername();
        try {
            auditPublisher.publishEvent("CREATE", "USUARIO", Map.of("username", userResponse.getUsername()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<UserResponse> assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            Principal principal) {
        UserResponse userResponse = userService.assigneRole(userId, roleId);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "USUARIO", Map.of("userId", userId.toString(), "roleId", roleId.toString()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(userResponse);
    }
}