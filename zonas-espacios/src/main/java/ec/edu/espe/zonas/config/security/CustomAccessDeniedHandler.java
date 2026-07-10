package ec.edu.espe.zonas.config.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        String json = "{"
                + "\"status\":" + HttpServletResponse.SC_FORBIDDEN + ","
                + "\"error\":\"Forbidden\","
                + "\"message\":\"No tienes permisos suficientes para acceder a este recurso.\","
                + "\"path\":\"" + request.getServletPath() + "\""
                + "}";
        response.getWriter().write(json);
    }
}
