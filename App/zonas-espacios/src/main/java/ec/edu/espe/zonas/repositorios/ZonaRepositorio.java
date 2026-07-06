package ec.edu.espe.zonas.repositorios;

import ec.edu.espe.zonas.entidades.Zona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ZonaRepositorio extends JpaRepository<Zona, UUID> {

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, UUID id);

    List<Zona> findByActivoTrue();

    boolean existsByCodigo(String codigo);

}