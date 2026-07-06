package ec.edu.espe.zonas.entidades;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Entity
@Table(name="zonas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Zona {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String nombre;

    @Column (nullable = false, unique = true)
    private String codigo; //ZON-VIP-01

    @Column (nullable = true)
    private String descripcion;



    @Column(nullable = true)
    private int capacidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoZona tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoZona estado;

    @Column(nullable = false)
    private boolean activo;

    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Espacio> espacios = new ArrayList<>();

    @Column
    private LocalDateTime fechaCreacion;

    @Column
    private LocalDateTime fechaActualizacion;

}
