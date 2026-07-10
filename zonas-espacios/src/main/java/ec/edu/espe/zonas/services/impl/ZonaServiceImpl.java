package ec.edu.espe.zonas.services.impl;

import ec.edu.espe.zonas.dto.request.ZonaRequestDTO;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.models.enums.EstadoZona;
import ec.edu.espe.zonas.models.enums.TipoZona;
import ec.edu.espe.zonas.models.Zona;
import ec.edu.espe.zonas.dto.response.ZonaResponseDto;
import ec.edu.espe.zonas.repositories.ZonaRepository;
import ec.edu.espe.zonas.repositories.EspacioRepository;
import ec.edu.espe.zonas.utils.MapperUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import ec.edu.espe.zonas.services.interfaz.ZonaService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ZonaServiceImpl implements ZonaService {

    private final ZonaRepository zonaRepository;
    private final EspacioRepository espacioRepository; // ¡Añadido para guardar los espacios!
    private final MapperUtils mapper;

    public ZonaServiceImpl(
            ZonaRepository zonaRepository,
            EspacioRepository espacioRepository,
            MapperUtils mapper) {
        this.zonaRepository = zonaRepository;
        this.espacioRepository = espacioRepository; // ¡Asignado correctamente!
        this.mapper = mapper;
    }

    @Override
    public List<ZonaResponseDto> listarZonas() {
        return zonaRepository.findAll()
                .stream()
                .map(mapper::toZonaResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ZonaResponseDto crearZona(ZonaRequestDTO requestDto) {
        if (zonaRepository.existsByNombre(requestDto.getNombre())) {
            throw new RuntimeException("Ya existe una zona con ese nombre");
        }
        Zona objZona = mapper.toZonaEntity(requestDto);
        TipoZona tipo = requestDto.getTipo();
        long siguientesZonas = zonaRepository.countByTipo(tipo) + 1;
        String codigoGenerado = generarCodigoZona(tipo, (int) siguientesZonas);
        objZona.setCodigo(codigoGenerado);
        Zona zonaGuardada = zonaRepository.save(objZona);
        return mapper.toZonaResponseDto(zonaGuardada);
    }

    @Override
    @Transactional
    public ZonaResponseDto actualizarZona(UUID idZona, ZonaRequestDTO requestDto) {
        if (!zonaRepository.existsById(idZona)) {
            throw new RuntimeException("No existe una zona con el id ingresado: " + idZona);
        }
        if (requestDto == null) return null;
        Zona objZona = mapper.toZonaEntity(requestDto);
        objZona.setId(idZona);
        return mapper.toZonaResponseDto(zonaRepository.save(objZona));
    }

    @Override
    @Transactional
    public ZonaResponseDto cambiarEstado(UUID idZona, EstadoZona nuevoEstado) {
        Zona zona = zonaRepository.findById(idZona)
                .orElseThrow(() -> new RuntimeException("Zona no encontrada con id: " + idZona));

        // 1. REGLA ESTRICTA: Bloquear inactivación si hay vehículos
        if (nuevoEstado == EstadoZona.ELIMINADA && zona.getEspacios() != null) {
            boolean tieneOcupados = zona.getEspacios().stream()
                    .anyMatch(esp -> esp.getEstado() == EstadoEspacio.OCUPADO || 
                                     esp.getEstado() == EstadoEspacio.RESERVADO);
            if (tieneOcupados) {
                throw new RuntimeException("ALERTA: No se puede inactivar/eliminar la zona. Existen vehículos (OCUPADOS o RESERVADOS).");
            }
        }

        zona.setEstado(nuevoEstado);
        zona.setFechaActualizacion(java.time.LocalDateTime.now());

        // 2. ACTUALIZACIÓN EN CASCADA PARA LOS ESPACIOS
        if (zona.getEspacios() != null && !zona.getEspacios().isEmpty()) {
            if (nuevoEstado == EstadoZona.MANTENIMIENTO) {
                zona.getEspacios().forEach(esp -> {
                    if (esp.getEstado() == EstadoEspacio.DISPONIBLE) {
                        esp.setEstado(EstadoEspacio.MANTENIMIENTO);
                        esp.setFechaActualizacion(java.time.LocalDateTime.now());
                    }
                });
            } else if (nuevoEstado == EstadoZona.ELIMINADA) {
                zona.getEspacios().forEach(esp -> {
                    esp.setEstado(EstadoEspacio.INACTIVO);
                    esp.setFechaActualizacion(java.time.LocalDateTime.now());
                });
            } else if (nuevoEstado == EstadoZona.ACTIVA) {
                zona.getEspacios().forEach(esp -> {
                    if (esp.getEstado() == EstadoEspacio.INACTIVO || esp.getEstado() == EstadoEspacio.MANTENIMIENTO) {
                        esp.setEstado(EstadoEspacio.DISPONIBLE);
                        esp.setFechaActualizacion(java.time.LocalDateTime.now());
                    }
                });
            }
            // 3. ¡EL SECRETO!: Forzamos a la BD a guardar los espacios modificados
            espacioRepository.saveAll(zona.getEspacios());
        }

        Zona objZona = zonaRepository.save(zona);
        return mapper.toZonaResponseDto(objZona);
    }

    @Override
    @Transactional
    public void eliminarZona(UUID idZona) {
        // Ahora el método DELETE reutiliza toda la lógica de validación y cascada
        cambiarEstado(idZona, EstadoZona.ELIMINADA);
    }

    private String generarCodigoZona(TipoZona tipoZona, int numero) {
        String nombreEnum = tipoZona.name();
        String prefijo = nombreEnum.length() >= 3 ? nombreEnum.substring(0, 3) : nombreEnum;
        prefijo = prefijo.toUpperCase();
        String numFormateado = String.format("%02d", numero);
        return "ZON-" + prefijo + "-" + numFormateado;
    }
}