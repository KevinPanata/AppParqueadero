package ec.edu.espe.zonas.repositories;

import ec.edu.espe.zonas.models.Zona;
import ec.edu.espe.zonas.models.enums.TipoZona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ZonaRepository extends JpaRepository<Zona, UUID> {

    boolean existsByNombre(String nombre);

    long countByTipo(TipoZona tipo);

}