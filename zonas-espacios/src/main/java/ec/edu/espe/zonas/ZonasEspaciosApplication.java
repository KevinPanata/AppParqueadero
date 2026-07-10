package ec.edu.espe.zonas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZonasEspaciosApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZonasEspaciosApplication.class, args);
    }

}
