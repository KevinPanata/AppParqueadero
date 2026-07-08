package ec.edu.espe.zonas.servicios.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.zonas.dto.AuditEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.rabbitmq.exchange:exchange_audit}")
    private String exchangeName;

    @Value("${spring.rabbitmq.routing-key:routing_audit}")
    private String routingKey;

    public void publishEvent(AuditEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend(exchangeName, routingKey, message);
            log.debug(" Evento publicado: {} - {} - {}",
                    event.getServicio(), event.getAccion(), event.getEntidad());
        } catch (AmqpException | com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error(" Error publicando evento: {}", e.getMessage());
        }
    }
}