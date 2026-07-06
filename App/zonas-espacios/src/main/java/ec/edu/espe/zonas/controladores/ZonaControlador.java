package ec.edu.espe.zonas.controladores;

import ec.edu.espe.zonas.dto.ZonaRequestDTO;
import ec.edu.espe.zonas.response.ZonaResponseDto;
import ec.edu.espe.zonas.servicios.interfaz.ZonaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaControlador {

    private final ZonaServicio servicioZonas;

    // LISTAR TODAS LAS ZONAS
    @GetMapping
    public ResponseEntity<List<ZonaResponseDto>> listarZonas() {
        return ResponseEntity.ok(servicioZonas.listarZonas());
    }

    // CREAR ZONA
    @PostMapping
    public ResponseEntity<ZonaResponseDto> crearZona(@Valid @RequestBody ZonaRequestDTO dto) {
        ZonaResponseDto responseDto = servicioZonas.crear(dto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // ACTUALIZAR ZONA
    @PutMapping("/{idZona}")
    public ResponseEntity<ZonaResponseDto> actualizarZona(
            @PathVariable UUID idZona,
            @Valid @RequestBody ZonaRequestDTO dto) {
        return ResponseEntity.ok(servicioZonas.actualizar(idZona, dto));
    }

    // ELIMINAR ZONA
    @DeleteMapping("/{idZona}")
    public ResponseEntity<Void> eliminarZona(@PathVariable UUID idZona) {
        servicioZonas.eliminarZona(idZona);
        return ResponseEntity.noContent().build();
    }
}
