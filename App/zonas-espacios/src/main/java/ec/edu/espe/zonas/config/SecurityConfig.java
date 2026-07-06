package ec.edu.espe.zonas.config;

import ec.edu.espe.zonas.security.CustomAccessDeniedHandler;
import ec.edu.espe.zonas.security.CustomAuthenticationEntryPoint;
import ec.edu.espe.zonas.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth

                        // PÚBLICOS
                        .requestMatchers(HttpMethod.GET, "/api/zonas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/espacios").permitAll()

                        // SOLO ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/zonas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/zonas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/zonas/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/espacios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/espacios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/espacios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/espacios/**").hasRole("ADMIN")

                        // CONSULTAS PRIVADAS
                        .requestMatchers(HttpMethod.GET, "/api/espacios/**").hasAnyRole("ADMIN", "CLIENTE")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}