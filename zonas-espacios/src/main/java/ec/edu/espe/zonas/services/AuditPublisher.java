package ec.edu.espe.zonas.services;

import ec.edu.espe.zonas.dto.event.AuditEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;
import java.util.Map;

@Service
public class AuditPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routingkey}")
    private String routingKey;

    public void publishEvent(String action, String entidad, Map<String, Object> datos, String usuario) {
        String ip = getLocalIp();
        String mac = getLocalMac();

        AuditEvent event = AuditEvent.builder()
                .servicio("ms-espacios")
                .action(action)
                .entidad(entidad)
                .datos(datos)
                .usuario(usuario != null ? usuario : "system")
                .ip(ip)
                .mac(mac)
                .build();

        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            System.out.println("Evento de auditoría registrado con éxito: ms-espacios - " + action + " - " + entidad);
        } catch (Exception e) {
            System.err.println("Error publishing audit event: " + e.getMessage());
        }
    }

    private String getLocalIp() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "127.0.0.1";
        }
    }

    private String getLocalMac() {
        try {
            InetAddress ip = InetAddress.getLocalHost();
            NetworkInterface network = NetworkInterface.getByInetAddress(ip);
            if (network == null) {
                Enumeration<NetworkInterface> networks = NetworkInterface.getNetworkInterfaces();
                while (networks.hasMoreElements()) {
                    NetworkInterface net = networks.nextElement();
                    if (!net.isLoopback() && net.isUp()) {
                        byte[] mac = net.getHardwareAddress();
                        if (mac != null) {
                            return formatMac(mac);
                        }
                    }
                }
                return "01:23:45:67:89:ab";
            }
            byte[] mac = network.getHardwareAddress();
            if (mac != null) {
                return formatMac(mac);
            }
        } catch (Exception e) {
            // Ignore
        }
        return "01:23:45:67:89:ab";
    }

    private String formatMac(byte[] mac) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < mac.length; i++) {
            sb.append(String.format("%02x%s", mac[i], (i < mac.length - 1) ? ":" : ""));
        }
        return sb.toString();
    }
}
