package com.edu.espe.usuarios.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        // Esto obliga a Spring Boot a enviar los mensajes como JSON puro
        return new Jackson2JsonMessageConverter();
    }
}