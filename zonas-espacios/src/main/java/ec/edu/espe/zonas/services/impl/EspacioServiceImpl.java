package ec.edu.espe.zonas.services.impl;

import ec.edu.espe.zonas.dto.request.EspacioRequestDTO;
import ec.edu.espe.zonas.models.Espacio;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.models.Zona;
import ec.edu.espe.zonas.models.enums.TipoEspacio;
import ec.edu.espe.zonas.repositories.EspacioRepository;
import ec.edu.espe.zonas.repositories.ZonaRepository;
import ec.edu.espe.zonas.dto.response.EspacioResponseDto;
import ec.edu.espe.zonas.services.interfaz.EspacioService;
import ec.edu.espe.zonas.utils.MapperUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EspacioServiceImpl implements EspacioService {

    private final EspacioRepository espacioRepository;
    private final ZonaRepository zonaRepository;
    private final MapperUtils mapper;

    public EspacioServiceImpl(EspacioRepository espacioRepository, ZonaRepository zonaRepository, MapperUtils mapper) {
        this.espacioRepository = espacioRepository;
        this.zonaRepository = zonaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<EspacioResponseDto> obtenerEspacios() {
        return espacioRepository.findAll()
                .stream()
                .map(mapper::toEspacioResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EspacioResponseDto crearEspacio(EspacioRequestDTO requestDto) {
        // 1. Obtenemos la zona por el ID enviado
        Zona zona = zonaRepository.findById(requestDto.getIdZona())
                .orElseThrow(() -> new RuntimeException("Zona no encontrada con id: " + requestDto.getIdZona()));

        // 2. Validamos la capacidad máxima de la zona
        int totalEspacios = espacioRepository.findByZonaId(zona.getId()).size();

        if (totalEspacios >= zona.getCapacidad()) {
            throw new RuntimeException("No se puede crear el espacio. La zona '" + zona.getNombre() +
                    "' ha alcanzado su capacidad máxima permitida de " + zona.getCapacidad() + " espacios.");
        }

        // 3. Calculamos el secuencial (Ej: si hay 0, el primero será 1)
        int numeroEspacio = totalEspacios + 1;

        // 4. Mapeamos el DTO a la Entidad utilizando el mapper limpio
        Espacio espacio = mapper.toEspacioEntity(requestDto);

        // 5. Generamos el nombre combinando el Nombre de la Zona y el Secuencial (001, 002, etc.)
        String nombreGenerado = generarNombreEspacio(zona.getCodigo(), numeroEspacio);

        // 6. Seteamos los campos requeridos
        espacio.setNombre(nombreGenerado);
        espacio.setZona(zona);

        // Guardamos y retornamos
        Espacio guardado = espacioRepository.save(espacio);
        return mapper.toEspacioResponseDto(guardado);
    }

    @Override
    @Transactional
    public EspacioResponseDto actualizarEspacio(UUID id, EspacioRequestDTO requestDto) {
        Espacio espacioExistente = espacioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));

        espacioExistente.setDescripcion(requestDto.getDescripcion());
        // El tipo se mantiene heredado de la zona para evitar inconsistencias
        espacioExistente.setFechaActualizacion(LocalDateTime.now());

        Espacio actualizado = espacioRepository.save(espacioExistente);
        return mapper.toEspacioResponseDto(actualizado);
    }

    @Override
    @Transactional
    public void eliminarEspacio(UUID id) {
        // 1. Buscamos el espacio completo en la base de datos
        Espacio espacio = espacioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));

        // 2. VALIDACIÓN: Si su estado NO es INACTIVO, se bloquea la eliminación
        if (espacio.getEstado() != EstadoEspacio.INACTIVO) {
            throw new RuntimeException("No se puede eliminar el espacio '" + espacio.getNombre() +
                    "'. Debe cambiar su estado a 'INACTIVO' antes de proceder.");
        }

        // 3. Si está INACTIVO, el sistema da luz verde para borrarlo físicamente
        espacioRepository.delete(espacio); // O también puedes usar espacioRepository.deleteById(id);
    }

    @Override
    public EspacioResponseDto obtenerEspacio(UUID id) {
        Espacio espacio = espacioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));
        return mapper.toEspacioResponseDto(espacio);
    }

    @Override
    @Transactional
    public EspacioResponseDto cambiarEstado(UUID id, EstadoEspacio estado) {
        Espacio espacio = espacioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado con id: " + id));

        espacio.setEstado(estado);
        espacio.setFechaActualizacion(LocalDateTime.now());

        return mapper.toEspacioResponseDto(espacioRepository.save(espacio));
    }

    @Override
    public List<EspacioResponseDto> obtenerEspaciosPorEstado(EstadoEspacio estado) {
        return espacioRepository.findByEstado(estado)
                .stream()
                .map(mapper::toEspacioResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EspacioResponseDto> obtenerEspaciosPorZonaEstado(UUID idZona, EstadoEspacio estado) {
        return espacioRepository.findByZonaIdAndEstado(idZona, estado)
                .stream()
                .map(mapper::toEspacioResponseDto)
                .collect(Collectors.toList());
    }

    // ---- Métodos auxiliares privados ----

    private String generarNombreEspacio(String codigoZona, int numeroEspacio) {
        // Transforma el entero 1 en "001", el 2 en "002", etc.
        String secuencialFormateado = String.format("%03d", numeroEspacio);

        // Retorna el formato exacto: "Nombre de la Zona-001"
        return codigoZona + "-" + secuencialFormateado;
    }
}