package ec.edu.espe.zonas.repositories;

import ec.edu.espe.zonas.models.Espacio;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EspacioRepository extends JpaRepository<Espacio, UUID> {

    // Optimización: Recibe directamente el UUID de la zona en lugar del objeto completo
    List<Espacio> findByZonaId(UUID idZona);

    // Optimización: Recibe el UUID de la zona y el Enum del estado
    List<Espacio> findByZonaIdAndEstado(UUID idZona, EstadoEspacio estado);

    // Este se mantiene impecable
    List<Espacio> findByEstado(EstadoEspacio estado);

    // Query Corregida: Agrupa por el nombre de la zona directamente para evitar fallos de persistencia
    @Query("SELECT e.zona.nombre, COUNT(e) FROM Espacio e WHERE e.estado = :estado GROUP BY e.zona.nombre")
    List<Object[]> findEspaciosPorEstadoAgrupadosPorZona(@Param("estado") EstadoEspacio estado);
}