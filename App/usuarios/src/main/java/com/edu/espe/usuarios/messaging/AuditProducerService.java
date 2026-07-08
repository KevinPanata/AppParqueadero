package com.edu.espe.usuarios.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditProducerService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${audit.rabbitmq.exchange}")
    private String exchange;

    @Value("${audit.rabbitmq.routing-key}")
    private String routingKey;

    public void enviarEventoAuditoria(String accion, String entidad, Map<String, Object> datos, UUID usuarioId) {
        
        String ipFalsaLocal = "127.0.0.1";
        String macFalsaLocal = "00:00:00:00:00:00";

        // Extraemos el usuario que hizo la petición del JWT
        String usuarioEjecutor = "sistema"; 
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            usuarioEjecutor = auth.getName(); 
        }

        Map<String, Object> evento = new HashMap<>();
        evento.put("servicio", "ms-usuarios");
        evento.put("accion", accion);
        evento.put("entidad", entidad);
        evento.put("datos", datos);
        evento.put("usuario", usuarioEjecutor); 
        
        if (usuarioId != null) {
            evento.put("idPersona", usuarioId.toString());
        }
        
        evento.put("ip", ipFalsaLocal);
        evento.put("mac", macFalsaLocal);

        rabbitTemplate.convertAndSend(exchange, routingKey, evento);
    }
}