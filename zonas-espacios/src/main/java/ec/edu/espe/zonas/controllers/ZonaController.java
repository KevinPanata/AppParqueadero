package ec.edu.espe.zonas.controllers;

import ec.edu.espe.zonas.dto.request.ZonaRequestDTO;
import ec.edu.espe.zonas.dto.response.ZonaResponseDto;
import ec.edu.espe.zonas.models.enums.EstadoZona;
import ec.edu.espe.zonas.services.interfaz.ZonaService;
import ec.edu.espe.zonas.services.AuditPublisher;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaService serviceZonas;
    private final AuditPublisher auditPublisher;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<List<ZonaResponseDto>> listarZonas() {
        return ResponseEntity.ok(serviceZonas.listarZonas());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<ZonaResponseDto> crearZona(@Valid @RequestBody ZonaRequestDTO dto, Principal principal) {
        ZonaResponseDto response = serviceZonas.crearZona(dto);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("CREATE", "ZONA", Map.of("nombre", response.getNombre()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{idZona}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<ZonaResponseDto> actualizarZona(
            @PathVariable UUID idZona,
            @Valid @RequestBody ZonaRequestDTO dto,
            Principal principal) {
        ZonaResponseDto response = serviceZonas.actualizarZona(idZona, dto);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "ZONA", Map.of("id", idZona.toString(), "nombre", response.getNombre()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // @PatchMapping("/{idZona}/estado-activo")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    // public ResponseEntity<ZonaResponseDto> cambiarEstadoActivo(
    //         @PathVariable UUID idZona,
    //         @RequestParam boolean activo,
    //         Principal principal) {

    //     ZonaResponseDto respuesta = serviceZonas.cambiarEstadoActivo(idZona, activo);
    //     String actor = principal != null ? principal.getName() : "system";
    //     try {
    //         auditPublisher.publishEvent("UPDATE", "ZONA", Map.of("id", idZona.toString(), "activo", activo), actor);
    //     } catch (Exception e) {
    //         System.err.println("Error publishing audit event: " + e.getMessage());
    //     }
    //     return ResponseEntity.ok(respuesta);
    // }

    @PatchMapping("/{idZona}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<ZonaResponseDto> cambiarEstado(
            @PathVariable UUID idZona,
            @RequestParam EstadoZona nuevoEstado,
            Principal principal) {

        // Asegúrate de cambiar el nombre del método en tu interfaz ZonaService a cambiarEstado
        ZonaResponseDto respuesta = serviceZonas.cambiarEstado(idZona, nuevoEstado);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "ZONA", Map.of("id", idZona.toString(), "estado", nuevoEstado.name()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{idZona}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<Void> eliminarZona(@PathVariable UUID idZona, Principal principal) {
        serviceZonas.eliminarZona(idZona);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("DELETE", "ZONA", Map.of("id", idZona.toString()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }
}