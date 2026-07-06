package ec.edu.espe.zonas.repositorios;

import ec.edu.espe.zonas.entidades.Espacio;
import ec.edu.espe.zonas.entidades.EstadoEspacio;
import ec.edu.espe.zonas.entidades.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EspacioRepositorio extends JpaRepository<Espacio, UUID> {

    List<Espacio> findByZona(Zona zona);

    List<Espacio> findByZonaAndEstado(Zona zona, EstadoEspacio estado);

    List<Espacio> findByEstado(EstadoEspacio estado);

    long countByZona(Zona zona);

    long countByZonaAndActivoTrue(Zona zona);

    long countByZonaAndEstado(Zona zona, EstadoEspacio estado);

    boolean existsByNombre(String nombre);

    boolean existsByZonaAndEstado(Zona zona, EstadoEspacio estado);

    @Query("SELECT e.zona, COUNT(e) FROM Espacio e WHERE e.estado = :estado GROUP BY e.zona")
    List<Object[]> findEspaciosPorEstadoAgrupadosPorZona(@Param("estado") EstadoEspacio estado);

    List<Espacio> findByActivoTrue();
    List<Espacio> findByEstadoAndActivoTrue(EstadoEspacio estado);
    List<Espacio> findByZonaAndEstadoAndActivoTrue(Zona zona, EstadoEspacio estado);
}