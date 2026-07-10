package ec.edu.espe.zonas.services;

import ec.edu.espe.zonas.models.Espacio;
import ec.edu.espe.zonas.models.enums.EstadoEspacio;
import ec.edu.espe.zonas.repositories.EspacioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservaScheduler {

    private final EspacioRepository espacioRepository;

    // Se ejecuta cada minuto (60000 ms)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void liberarReservasExpiradas() {
        // Reservas que tienen más de 3 minutos
        // Cambia .minusMinutes(5) por .minusMinutes(3) 
        LocalDateTime limite = LocalDateTime.now().minusMinutes(3);

        List<Espacio> espaciosReservados = espacioRepository.findByEstado(EstadoEspacio.RESERVADO);

        for (Espacio espacio : espaciosReservados) {
            // Comparamos la fecha de última actualización
            if (espacio.getFechaActualizacion() != null && espacio.getFechaActualizacion().isBefore(limite)) {
                espacio.setEstado(EstadoEspacio.DISPONIBLE);
                espacio.setFechaActualizacion(LocalDateTime.now());
                espacioRepository.save(espacio);
                System.out.println("⚠️ Reserva expirada: El espacio " + espacio.getNombre() + " vuelve a estar DISPONIBLE.");
            }
        }
    }
}