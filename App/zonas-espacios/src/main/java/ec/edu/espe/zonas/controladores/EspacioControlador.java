// ec.edu.espe.zonas.controladores.EspacioControlador.java
package ec.edu.espe.zonas.controladores;

import ec.edu.espe.zonas.dto.CambiarEstadoEspacioDTO;
import ec.edu.espe.zonas.dto.EspacioRequestDTO;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.response.EspacioResponseDto;
import ec.edu.espe.zonas.servicios.interfaz.EspacioServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/espacios")
@RequiredArgsConstructor
public class EspacioControlador {

    private final EspacioServicio servicioEspacios;

    @GetMapping
    public ResponseEntity<List<EspacioResponseDto>> listarEspacios() {
        return ResponseEntity.ok(servicioEspacios.obtenerEspacios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EspacioResponseDto> obtenerEspacio(@PathVariable UUID id) {
        return ResponseEntity.ok(servicioEspacios.obtenerEspacio(id));
    }

    @PostMapping
    public ResponseEntity<EspacioResponseDto> crearEspacio(@Valid @RequestBody EspacioRequestDTO dto) {
        EspacioResponseDto responseDto = servicioEspacios.crearEspacio(dto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EspacioResponseDto> actualizarEspacio(
            @PathVariable UUID id,
            @Valid @RequestBody EspacioRequestDTO dto) {
        return ResponseEntity.ok(servicioEspacios.actualizarEspacio(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EspacioResponseDto> cambiarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody CambiarEstadoEspacioDTO dto) {
        return ResponseEntity.ok(servicioEspacios.cambiarEstado(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEspacio(@PathVariable UUID id) {
        servicioEspacios.eliminarEspacio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<EspacioResponseDto>> espaciosPorEstado(
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(servicioEspacios.espaciosPorEstado(estado));
    }

    @GetMapping("/zona/{idZona}/estado/{estado}")
    public ResponseEntity<List<EspacioResponseDto>> espaciosPorZonaYEstado(
            @PathVariable UUID idZona,
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(servicioEspacios.obtenerEspaciosPorZonaYEstado(idZona, estado));
    }

    @GetMapping("/estadisticas/{estado}")
    public ResponseEntity<Map<String, Long>> estadisticasPorEstado(
            @PathVariable EstadoEspacio estado) {
        return ResponseEntity.ok(servicioEspacios.obtenerEspaciosPorEstadoAgrupadosPorZona(estado));
    }
}