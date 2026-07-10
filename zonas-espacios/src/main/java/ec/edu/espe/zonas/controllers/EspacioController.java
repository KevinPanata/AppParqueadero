package ec.edu.espe.zonas.controllers;

import ec.edu.espe.zonas.dto.request.EspacioRequestDTO;
import ec.edu.espe.zonas.dto.response.EspacioResponseDto;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.services.interfaz.EspacioService;
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
@RequestMapping("/api/espacios")
@RequiredArgsConstructor
public class EspacioController {

    private final EspacioService espacioService;
    private final AuditPublisher auditPublisher;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<List<EspacioResponseDto>> obtenerEspacios() {
        return ResponseEntity.ok(espacioService.obtenerEspacios());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<EspacioResponseDto> obtenerEspacioPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(espacioService.obtenerEspacio(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<EspacioResponseDto> crearEspacio(@Valid @RequestBody EspacioRequestDTO dto, Principal principal) {
        EspacioResponseDto response = espacioService.crearEspacio(dto);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("CREATE", "ESPACIO", Map.of("nombre", response.getNombre(), "idZona", dto.getIdZona().toString()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<EspacioResponseDto> actualizarEspacio(
            @PathVariable UUID id,
            @Valid @RequestBody EspacioRequestDTO dto,
            Principal principal) {
        EspacioResponseDto response = espacioService.actualizarEspacio(id, dto);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "ESPACIO", Map.of("id", id.toString(), "nombre", response.getNombre()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN')")
    public ResponseEntity<Void> eliminarEspacio(@PathVariable UUID id, Principal principal) {
        espacioService.eliminarEspacio(id);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("DELETE", "ESPACIO", Map.of("id", id.toString()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<EspacioResponseDto> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam EstadoEspacio nuevoEstado,
            Principal principal) {
        EspacioResponseDto response = espacioService.cambiarEstado(id, nuevoEstado);
        String actor = principal != null ? principal.getName() : "system";
        try {
            auditPublisher.publishEvent("UPDATE", "ESPACIO", Map.of("id", id.toString(), "estado", nuevoEstado.name()), actor);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<List<EspacioResponseDto>> obtenerEspaciosPorEstado(@PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(espacioService.obtenerEspaciosPorEstado(estado));
    }

    @GetMapping("/zona/{idZona}/estado/{estado}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')")
    public ResponseEntity<List<EspacioResponseDto>> obtenerEspaciosPorZonaEstado(
            @PathVariable UUID idZona,
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(espacioService.obtenerEspaciosPorZonaEstado(idZona, estado));
    }

}